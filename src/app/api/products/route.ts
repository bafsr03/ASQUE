import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheGet, cacheSet, cacheInvalidateTag, CacheKeys, CacheTags } from "@/lib/cache";
import { CreateProductSchema } from "@/lib/validation";

// GET /api/products - List all products
export async function GET(request: NextRequest) {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting - 30 requests per minute
        const rateLimit = await checkRateLimit(userId, "QUOTE_LIST"); // Reusing quote list limit for simplicity
        if (!rateLimit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        // Check cache for non-search results
        const cacheKey = search || category ? null : CacheKeys.productList(userId);
        if (cacheKey) {
            const cached = await cacheGet(cacheKey);
            if (cached) return NextResponse.json(cached);
        }

        const where: any = { userId };
        if (search) {
            where.OR = [
                { code: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { shortDesc: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category) {
            where.category = category;
        }

        const products = await prisma.product.findMany({
            where,
            include: { links: true },
            orderBy: { createdAt: "desc" },
        });

        if (cacheKey) {
            await cacheSet(cacheKey, products, 300, [CacheTags.PRODUCTS(userId)]);
        }

        return NextResponse.json(products);
    } catch (error) {
        return handleError(error, requestId, "Fetch Products");
    }
}

// POST /api/products - Create a new product
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
        const validation = CreateProductSchema.safeParse(body);
        if (!validation.success) return handleError(validation.error, requestId, "Product Validation");

        const { links, ...productData } = validation.data;

        logger.info("Creating product", { requestId, userId, code: productData.code });

        const product = await prisma.product.create({
            data: {
                ...productData,
                userId,
                links: links ? { create: links as any } : undefined,
            },
            include: { links: true },
        });

        await cacheInvalidateTag(CacheTags.PRODUCTS(userId));
        logger.info("Product created successfully", { requestId, userId, productId: product.id });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return handleError(error, requestId, "Create Product");
    }
}
