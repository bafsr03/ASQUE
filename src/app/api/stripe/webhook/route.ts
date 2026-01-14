import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { logger, generateRequestId } from "@/lib/logger";
import { cacheInvalidateTag, CacheTags } from "@/lib/cache";

export async function POST(req: Request) {
    const requestId = generateRequestId();
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        logger.error("Webhook signature verification failed", error, { requestId });
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    logger.info("Received Stripe webhook", { requestId, eventType: event.type, eventId: event.id });

    try {
        const session = event.data.object as Stripe.Checkout.Session;

        if (event.type === "checkout.session.completed") {
            if (!session?.metadata?.userId) {
                logger.error("Webhook missing userId in metadata", null, { requestId, sessionId: session.id });
                return new NextResponse("User id is required", { status: 400 });
            }

            const userId = session.metadata.userId;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    stripeCustomerId: session.customer as string,
                    subscriptionStatus: "PRO",
                    subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });

            // Invalidate user and subscription caches
            await cacheInvalidateTag(CacheTags.USER(userId));
            await cacheInvalidateTag(CacheTags.SUBSCRIPTION(userId));

            logger.info("User subscription activated via checkout", { requestId, userId });
        }

        if (event.type === "invoice.payment_succeeded") {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            ) as any;

            const user = await prisma.user.update({
                where: {
                    stripeCustomerId: subscription.customer as string,
                },
                data: {
                    subscriptionStatus: "PRO",
                    subscriptionEnds: new Date(subscription.current_period_end * 1000),
                },
            });

            const userId = user.id;
            await cacheInvalidateTag(CacheTags.USER(userId));
            await cacheInvalidateTag(CacheTags.SUBSCRIPTION(userId));

            logger.info("Subscription payment succeeded", { requestId, userId });
        }

        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;

            const user = await prisma.user.update({
                where: {
                    stripeCustomerId: subscription.customer as string,
                },
                data: {
                    subscriptionStatus: "FREE",
                    subscriptionEnds: null,
                },
            });

            const userId = user.id;
            await cacheInvalidateTag(CacheTags.USER(userId));
            await cacheInvalidateTag(CacheTags.SUBSCRIPTION(userId));

            logger.info("Subscription deleted", { requestId, userId });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        logger.error("Error processing webhook event", error, { requestId, eventType: event.type });
        return new NextResponse("Webhook Processing Failed", { status: 500 });
    }
}
