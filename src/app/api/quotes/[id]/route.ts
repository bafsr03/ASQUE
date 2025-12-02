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
