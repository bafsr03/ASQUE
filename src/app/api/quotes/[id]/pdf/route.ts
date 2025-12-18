import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToStream } from "@react-pdf/renderer";
import QuotePDF from "@/components/pdf/QuotePDFTemplate";
import { createElement } from "react";

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

        // Fetch settings (or create default) for the quote's owner
        let settings = await prisma.settings.findUnique({
            where: { userId: quote.userId }
        });

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    userId: quote.userId,
                    companyName: "My Company",
                    primaryColor: "#2563eb",
                    secondaryColor: "#1e40af",
                    font: "Helvetica",
                    template: "modern",
                },
            });
        }

        // Generate PDF stream
        const stream = await renderToStream(createElement(QuotePDF, { quote, settings }) as any);

        // Return PDF as response
        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Quote-${quote.quoteNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
