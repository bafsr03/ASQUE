import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export const MAX_FREE_QUOTES = 10;

export async function checkQuoteLimit() {
    const { userId } = await auth();
    if (!userId) return false;

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
}

export async function getUserSubscription() {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true, subscriptionEnds: true }
    });

    return user;
}
