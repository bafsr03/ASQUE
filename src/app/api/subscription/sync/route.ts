import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { logger, generateRequestId } from "@/lib/logger";
import { handleError } from "@/lib/errorHandler";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheSet, cacheInvalidateTag, CacheKeys, CacheTags } from "@/lib/cache";

export async function POST() {
    const requestId = generateRequestId();

    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            logger.warn("Unauthorized subscription sync attempt", { requestId });
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Rate limiting - 10 requests per minute
        const rateLimit = await checkRateLimit(userId, "SUBSCRIPTION");
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
                    },
                }
            );
        }

        logger.info("Starting subscription sync", { requestId, userId });

        const userRecord = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userRecord) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Fallback: If no stripeCustomerId, try to find one by email
        if (!userRecord.stripeCustomerId) {
            logger.info("No Stripe Customer ID in DB, searching by email...", { requestId, email: user.emailAddresses[0]?.emailAddress });

            const email = user.emailAddresses[0]?.emailAddress;
            if (email) {
                const customers = await stripe.customers.list({
                    email: email,
                    limit: 1,
                });

                if (customers.data.length > 0) {
                    // Found customer! Update DB
                    const customerId = customers.data[0].id;
                    logger.info("Found matching Stripe Customer by email", { requestId, customerId });

                    await prisma.user.update({
                        where: { id: userId },
                        data: { stripeCustomerId: customerId }
                    });

                    // Update local variable to proceed with sync
                    userRecord.stripeCustomerId = customerId;
                }
            }
        }

        if (!userRecord.stripeCustomerId) {
            logger.info("No Stripe customer found for user after email search", { requestId, userId });
            return NextResponse.json({
                error: "No stripe customer found",
                subscriptionStatus: "FREE"
            });
        }

        // Retry logic for Stripe API calls
        let subscriptions;
        let retries = 3;
        while (retries > 0) {
            try {
                subscriptions = await stripe.subscriptions.list({
                    customer: userRecord.stripeCustomerId,
                    status: 'active',
                    limit: 1,
                });
                break;
            } catch (stripeError) {
                retries--;
                if (retries === 0) throw stripeError;
                logger.warn("Stripe API retry", { requestId, userId, retriesLeft: retries });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
        }

        let subscriptionStatus = "FREE";
        let subscriptionEnds = null;

        if (subscriptions && subscriptions.data.length > 0) {
            const sub = subscriptions.data[0];
            subscriptionStatus = "PRO";
            subscriptionEnds = new Date((sub as any).current_period_end * 1000);

            logger.info("Active subscription found", {
                requestId,
                userId,
                subscriptionId: sub.id,
                periodEnd: subscriptionEnds.toISOString(),
            });
        } else {
            logger.info("No active subscription found", { requestId, userId });
        }

        // Update DB
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus,
                subscriptionEnds
            }
        });

        // Update cache
        await cacheSet(
            CacheKeys.userSubscription(userId),
            { subscriptionStatus, subscriptionEnds },
            5 * 60, // 5-minute TTL
            [CacheTags.SUBSCRIPTION(userId)]
        );

        // Invalidate user cache tag
        await cacheInvalidateTag(CacheTags.USER(userId));

        logger.info("Subscription sync completed", {
            requestId,
            userId,
            subscriptionStatus: updatedUser.subscriptionStatus,
        });

        return NextResponse.json(
            {
                subscriptionStatus: updatedUser.subscriptionStatus,
                subscriptionEnds: updatedUser.subscriptionEnds,
                isPro: updatedUser.subscriptionStatus === "PRO"
            },
            {
                headers: {
                    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                },
            }
        );

    } catch (error) {
        return handleError(error, requestId, "Subscription Sync");
    }
}
