import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/quotes/:id - Get a single quote
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quote = await prisma.quotation.findUnique({
            where: { id },
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

        if (!quote) {
            return NextResponse.json(
                { error: "Quote not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error("Error fetching quote:", error);
        return NextResponse.json(
            { error: "Failed to fetch quote" },
            { status: 500 }
        );
    }
}
// PUT /api/quotes/:id - Update a quote
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { clientId, date, validityDays, notes, paymentTerms, items, discount } = body;

        // Transaction to update quote and replace items
        const updatedQuote = await prisma.$transaction(async (tx) => {
            // Delete existing items
            await tx.quoteItem.deleteMany({
                where: { quoteId: id },
            });

            // Update quote and create new items
            return await tx.quotation.update({
                where: { id },
                data: {
                    clientId,
                    date: new Date(date),
                    validityDays: parseInt(validityDays),
                    notes,
                    paymentTerms,
                    discount: parseFloat(discount) || 0,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            subtotal: item.quantity * item.unitPrice,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });
        });

        return NextResponse.json(updatedQuote);
    } catch (error) {
        console.error("Error updating quote:", error);
        return NextResponse.json(
            { error: "Failed to update quote" },
            { status: 500 }
        );
    }
}

// DELETE /api/quotes/:id - Delete a quote
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete the quote (items should cascade delete strictly speaking, but depends on schema. 
        // Prisma usually handles cascade if defined in schema, or we delete explicitly)
        // Check schema first or just delete quote and rely on cascade. 
        // Assuming cascade or simple delete for now.

        // Explicitly deleting items first to be safe if cascade isn't set up
        await prisma.quoteItem.deleteMany({
            where: { quoteId: id }
        });

        await prisma.quotation.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting quote:", error);
        return NextResponse.json(
            { error: "Failed to delete quote" },
            { status: 500 }
        );
    }
}
