import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheGet, cacheSet, cacheInvalidateTag, CacheKeys, CacheTags } from "@/lib/cache";
import { CreateClientSchema } from "@/lib/validation";

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting
        const rateLimit = await checkRateLimit(userId, "API_DEFAULT");
        if (!rateLimit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        // Check cache for non-search results
        const cacheKey = search ? null : CacheKeys.clientList(userId);
        if (cacheKey) {
            const cached = await cacheGet(cacheKey);
            if (cached) return NextResponse.json(cached);
        }

        const where: any = { userId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { taxId: { contains: search } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        const clients = await prisma.client.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        if (cacheKey) {
            await cacheSet(cacheKey, clients, 300, [CacheTags.CLIENTS(userId)]);
        }

        return NextResponse.json(clients);
    } catch (error) {
        return handleError(error, requestId, "Fetch Clients");
    }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting
        const rateLimit = await checkRateLimit(userId, "API_DEFAULT");
        if (!rateLimit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

        const body = await request.json();
        const validation = CreateClientSchema.safeParse(body);
        if (!validation.success) return handleError(validation.error, requestId, "Client Validation");

        logger.info("Creating client", { requestId, userId, name: validation.data.name });

        const client = await prisma.client.create({
            data: { ...validation.data, userId },
        });

        await cacheInvalidateTag(CacheTags.CLIENTS(userId));
        logger.info("Client created successfully", { requestId, userId, clientId: client.id });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        return handleError(error, requestId, "Create Client");
    }
}
