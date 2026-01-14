import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { MAX_FREE_QUOTES } from "@/lib/constants";
import { logger, generateRequestId } from "@/lib/logger";
import { cacheGet, cacheSet, CacheKeys, CacheTags } from "@/lib/cache";

export async function checkQuoteLimit() {
    const { userId } = await auth();
    if (!userId) return false;

    // Check count directly from DB as it changes often
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { quoteCount: true, subscriptionStatus: true }
    });

    if (!user) return true; // Treats new users as having 0 quotes
    if (user.subscriptionStatus === 'PRO') return true;

    return user.quoteCount < MAX_FREE_QUOTES;
}

export async function incrementQuoteCount() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const email = user.emailAddresses[0]?.emailAddress ?? "";

    await prisma.user.upsert({
        where: { id: userId },
        update: { quoteCount: { increment: 1 } },
        create: {
            id: userId,
            email: email,
            quoteCount: 1,
        }
    });

    logger.debug("Incremented quote count", { userId });
}

export async function getUserSubscription() {
    const requestId = generateRequestId();
    const { userId } = await auth();
    if (!userId) return null;

    // Try cache first
    const cacheKey = CacheKeys.userSubscription(userId);
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true, subscriptionEnds: true }
    });

    if (user) {
        // Cache subscription status for 5 mins
        await cacheSet(cacheKey, user, 300, [CacheTags.SUBSCRIPTION(userId)]);
    }

    return user;
}
