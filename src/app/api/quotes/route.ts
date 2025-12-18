import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuoteNumber } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { checkQuoteLimit, incrementQuoteCount } from "@/lib/limits";

// GET /api/quotes - List all quotes
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        return NextResponse.json(quotes);
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return NextResponse.json(
            { error: "Failed to fetch quotes" },
            { status: 500 }
        );
    }
}

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canCreate = await checkQuoteLimit();
        if (!canCreate) {
            return NextResponse.json(
                { error: "Quote limit reached. Please upgrade to Pro." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { clientId, items, agentName, notes, paymentTerms, discount, validityDays } = body;

        // Generate quote number if not provided
        const quoteNumber = body.quoteNumber || generateQuoteNumber();

        // Calculate line items with subtotals
        const quoteItems = items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: (item.quantity * item.unitPrice) - (item.discount || 0),
        }));

        const quote = await prisma.quotation.create({
            data: {
                userId, // Associate with user
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

        // Increment usage count if successful
        await incrementQuoteCount();

        return NextResponse.json(quote, { status: 201 });
    } catch (error) {
        console.error("Error creating quote:", error);
        return NextResponse.json(
            { error: "Failed to create quote" },
            { status: 500 }
        );
    }
}
