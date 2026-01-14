import { NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/limits";
import { logger, generateRequestId } from "@/lib/logger";
import { cacheGet, cacheSet, CacheKeys, CacheTags } from "@/lib/cache";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const requestId = generateRequestId();

    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ isPro: false, subscriptionStatus: "FREE" });
        }

        // Check cache first
        const cached = await cacheGet(CacheKeys.userSubscription(userId));
        if (cached) {
            logger.debug("Subscription status served from cache", { requestId, userId });
            return NextResponse.json({
                isPro: cached.subscriptionStatus === "PRO",
                subscriptionStatus: cached.subscriptionStatus || "FREE"
            });
        }

        // Cache miss - fetch from database
        logger.debug("Subscription status cache miss", { requestId, userId });
        const subscription = await getUserSubscription();

        const result = {
            isPro: subscription?.subscriptionStatus === "PRO",
            subscriptionStatus: subscription?.subscriptionStatus || "FREE"
        };

        // Cache for 5 minutes
        await cacheSet(
            CacheKeys.userSubscription(userId),
            { subscriptionStatus: result.subscriptionStatus },
            5 * 60,
            [CacheTags.SUBSCRIPTION(userId)]
        );

        return NextResponse.json(result);
    } catch (error) {
        logger.error("Subscription status error", error, { requestId });
        return NextResponse.json({ isPro: false, subscriptionStatus: "FREE" });
    }
}
