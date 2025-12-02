import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/products - List all products
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        const where: any = {};

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
            include: {
                links: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { links, ...productData } = body;

        const product = await prisma.product.create({
            data: {
                ...productData,
                links: links
                    ? {
                        create: links,
                    }
                    : undefined,
            },
            include: {
                links: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
