import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { InitUserSchema } from "@/lib/validation";

/**
 * User Initialization Endpoint
 * This ensures that every authenticated user has a record in the Prisma database.
 * Should be called when the app loads for authenticated users.
 */
export async function POST() {
    const requestId = generateRequestId();

    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            logger.warn("Unauthorized user init attempt", { requestId });
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Rate limiting - 5 requests per minute
        const rateLimit = await checkRateLimit(userId, "AUTH");
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
                    },
                }
            );
        }

        const email = user.emailAddresses[0]?.emailAddress ?? "";

        // Validate email format
        const validation = InitUserSchema.safeParse({ email });
        if (!validation.success) {
            logger.warn("Invalid email format in user init", { requestId, userId, email });
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        logger.info("Initializing user", { requestId, userId, email });

        // Upsert user - creates if doesn't exist, does nothing if exists
        const userRecord = await prisma.user.upsert({
            where: { id: userId },
            update: {}, // Don't overwrite existing data
            create: {
                id: userId,
                email: email,
                subscriptionStatus: "FREE",
                quoteCount: 0,
            },
        });

        logger.info("User initialized successfully", {
            requestId,
            userId: userRecord.id,
            subscriptionStatus: userRecord.subscriptionStatus,
            isNewUser: userRecord.createdAt.getTime() === userRecord.updatedAt.getTime(),
        });

        return NextResponse.json(
            {
                success: true,
                userId: userRecord.id,
                subscriptionStatus: userRecord.subscriptionStatus,
            },
            {
                headers: {
                    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                },
            }
        );
    } catch (error) {
        return handleError(error, requestId, "User Init");
    }
}
