import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheInvalidateTag, CacheTags } from "@/lib/cache";

export async function POST(request: NextRequest) {
    const requestId = generateRequestId();
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            logger.warn("Unauthorized checkout attempt", { requestId });
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Rate limiting - 10 requests per minute
        const rateLimit = await checkRateLimit(userId, "SUBSCRIPTION");
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        logger.info("Initiating Stripe checkout", { requestId, userId });

        // Ensure user exists in our DB and get customer ID
        const userRecord = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: user.emailAddresses[0]?.emailAddress ?? "",
                subscriptionStatus: "FREE",
            },
        });

        const origin = request.headers.get("origin") || "http://localhost:3000";

        const sessionPayload: any = {
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'ASQUE Pro Plan',
                            description: 'Unlimited Quotes & Premium Features',
                        },
                        unit_amount: 500, // $5.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard?success=true`,
            cancel_url: `${origin}/dashboard?canceled=true`,
            metadata: {
                userId,
                requestId,
            },
        };

        if (userRecord.stripeCustomerId) {
            sessionPayload.customer = userRecord.stripeCustomerId;
        } else {
            sessionPayload.customer_email = user.emailAddresses[0]?.emailAddress;
        }

        const session = await stripe.checkout.sessions.create(sessionPayload);

        // Invalidate user cache on checkout initiation to ensure fresh data after return
        await cacheInvalidateTag(CacheTags.USER(userId));

        logger.info("Checkout session created", { requestId, userId, sessionId: session.id });

        return NextResponse.json({ url: session.url }, {
            headers: {
                "X-RateLimit-Remaining": rateLimit.remaining.toString()
            }
        });
    } catch (error) {
        return handleError(error, requestId, "Stripe Checkout");
    }
}
