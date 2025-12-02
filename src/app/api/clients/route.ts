import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { taxId: { contains: search } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        const clients = await prisma.client.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const client = await prisma.client.create({
            data: body,
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        );
    }
}
