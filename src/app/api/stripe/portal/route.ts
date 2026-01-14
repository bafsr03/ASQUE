import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userRecord = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userRecord) {
            console.error("Portal Error: User record not found in DB", { userId });
            return new NextResponse("User not found", { status: 404 });
        }

        if (!userRecord.stripeCustomerId) {
            console.error("Portal Error: No Stripe Customer ID", { userId, email: userRecord.email });
            return new NextResponse("No subscription found", { status: 404 });
        }

        // Create Stripe Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: userRecord.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?portal_return=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Portal Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
