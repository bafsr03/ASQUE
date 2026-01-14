import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuoteNumber } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { incrementQuoteCount, getUserSubscription } from "@/lib/limits";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheGet, cacheSet, cacheInvalidateTag, CacheKeys, CacheTags } from "@/lib/cache";
import { CreateQuoteSchema } from "@/lib/validation";

// GET /api/quotes - List all quotes
export async function GET() {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting - 30 requests per minute
        const rateLimit = await checkRateLimit(userId, "QUOTE_LIST");
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        // Check cache
        const cacheKey = CacheKeys.quoteList(userId);
        const cached = await cacheGet(cacheKey);
        if (cached) {
            logger.debug("Quotes list served from cache", { requestId, userId });
            return NextResponse.json(cached);
        }

        const quotes = await prisma.quotation.findMany({
            where: {
                userId,
            },
            include: {
                client: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Cache for 2 minutes
        await cacheSet(cacheKey, quotes, 120, [CacheTags.QUOTES(userId)]);

        return NextResponse.json(quotes);
    } catch (error) {
        return handleError(error, requestId, "Fetch Quotes");
    }
}

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check subscription status for rate limit tier
        const subscription = await getUserSubscription();
        const limitType = subscription?.subscriptionStatus === "PRO"
            ? "QUOTE_CREATE_PRO"
            : "QUOTE_CREATE_FREE";

        const rateLimit = await checkRateLimit(userId, limitType);
        if (!rateLimit.allowed) {
            logger.warn("Quote creation limit reached", { requestId, userId, limitType });
            return NextResponse.json(
                { error: "Quote limit reached. Please upgrade to Pro." },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate request body
        const validation = CreateQuoteSchema.safeParse(body);
        if (!validation.success) {
            return handleError(validation.error, requestId, "Quote Validation");
        }

        const { clientId, items, agentName, notes, paymentTerms, discount, validityDays } = validation.data;

        // Generate quote number if not provided
        const quoteNumber = validation.data.quoteNumber || generateQuoteNumber();

        logger.info("Creating new quote", { requestId, userId, quoteNumber, clientId });

        // Calculate line items with subtotals
        const quoteItems = items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: (item.quantity * item.unitPrice) - (item.discount || 0),
        }));

        const quote = await prisma.quotation.create({
            data: {
                userId,
                quoteNumber,
                clientId,
                agentName,
                notes,
                paymentTerms,
                discount: discount || 0,
                validityDays: validityDays || 15,
                items: {
                    create: quoteItems,
                },
            },
            include: {
                client: true,
                items: {
                    include: {
                        product: {
                            include: {
                                links: true,
                            },
                        },
                    },
                },
            },
        });

        // Increment cumulative usage count
        await incrementQuoteCount();

        // Invalidate quotes cache for this user
        await cacheInvalidateTag(CacheTags.QUOTES(userId));

        logger.info("Quote created successfully", { requestId, userId, quoteId: quote.id });

        return NextResponse.json(quote, {
            status: 201,
            headers: {
                "X-RateLimit-Remaining": rateLimit.remaining.toString()
            }
        });
    } catch (error) {
        return handleError(error, requestId, "Create Quote");
    }
}
