import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheGet, cacheSet, cacheInvalidateTag, CacheKeys, CacheTags } from "@/lib/cache";
import { UpdateSettingsSchema } from "@/lib/validation";

// GET /api/settings - Get settings (or create default)
export async function GET() {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Try cache first
        const cacheKey = CacheKeys.userSettings(userId);
        const cached = await cacheGet(cacheKey);

        // Fetch user metadata (count) separately or include in cache if stable
        const userRecord = await prisma.user.findUnique({
            where: { id: userId },
            select: { quoteCount: true, subscriptionStatus: true, subscriptionEnds: true }
        });

        if (cached) {
            logger.debug("Settings served from cache", { requestId, userId });
            return NextResponse.json({
                ...cached,
                quoteCount: userRecord?.quoteCount || 0,
                subscriptionStatus: userRecord?.subscriptionStatus || 'FREE',
                subscriptionEnds: userRecord?.subscriptionEnds
            });
        }

        // Ensure user exists
        await prisma.user.upsert({
            where: { id: userId },
            update: { email: user.emailAddresses[0]?.emailAddress || "" },
            create: { id: userId, email: user.emailAddresses[0]?.emailAddress || "" }
        });

        let settings = await prisma.settings.findUnique({
            where: { userId },
        });

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    companyName: "My Company",
                    primaryColor: "#2563eb",
                    secondaryColor: "#1e40af",
                    font: "Helvetica",
                    template: "modern",
                    userId,
                },
            });
            logger.info("Default settings created", { requestId, userId });
        }

        await cacheSet(cacheKey, settings, 600, [CacheTags.USER(userId)]);

        return NextResponse.json({
            ...settings,
            quoteCount: userRecord?.quoteCount || 0,
            subscriptionStatus: userRecord?.subscriptionStatus || 'FREE',
            subscriptionEnds: userRecord?.subscriptionEnds
        });
    } catch (error) {
        return handleError(error, requestId, "Fetch Settings");
    }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...data } = body;

        // Validate
        const validation = UpdateSettingsSchema.safeParse(data);
        if (!validation.success) return handleError(validation.error, requestId, "Settings Validation");

        const settings = await prisma.settings.upsert({
            where: { userId },
            update: validation.data,
            create: {
                ...validation.data as any,
                userId,
                companyName: validation.data.companyName || "My Company",
            },
        });

        await cacheInvalidateTag(CacheTags.USER(userId));
        logger.info("Settings updated", { requestId, userId });

        return NextResponse.json(settings);
    } catch (error) {
        return handleError(error, requestId, "Update Settings");
    }
}
