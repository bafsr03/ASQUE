import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuoteNumber } from "@/lib/utils";

// GET /api/quotes - List all quotes
export async function GET() {
    try {
        const quotes = await prisma.quotation.findMany({
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

        return NextResponse.json(quote, { status: 201 });
    } catch (error) {
        console.error("Error creating quote:", error);
        return NextResponse.json(
            { error: "Failed to create quote" },
            { status: 500 }
        );
    }
}
