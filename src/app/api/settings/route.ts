import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

// GET /api/settings - Get settings (or create default)
export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ensure user exists in DB
        // This is a safety check to ensure the user record exists before we try to create settings
        // In a production app, this should be handled by webhooks, but this ensures it works for MVP
        await prisma.user.upsert({
            where: { id: userId },
            update: {
                email: user.emailAddresses[0]?.emailAddress || "unknown@example.com",
            },
            create: {
                id: userId,
                email: user.emailAddresses[0]?.emailAddress || "unknown@example.com",
            }
        });

        let settings = await prisma.settings.findUnique({
            where: { userId },
        });

        if (!settings) {
            const defaultSettings = {
                companyName: "My Company",
                primaryColor: "#2563eb",
                secondaryColor: "#1e40af",
                font: "Helvetica",
                template: "modern",
            };

            // Try create (upsert logic safer but create is fine if we just checked)
            settings = await prisma.settings.create({
                data: {
                    ...defaultSettings,
                    userId,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...data } = body;

        const settings = await prisma.settings.upsert({
            where: { userId },
            update: data,
            create: {
                ...data,
                userId,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
