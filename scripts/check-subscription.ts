import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching all users...')
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            subscriptionStatus: true,
            stripeCustomerId: true,
            subscriptionEnds: true,
            quoteCount: true,
        }
    })

    console.log('\n=== Current Users ===')
    users.forEach(user => {
        console.log(`\nUser ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Subscription: ${user.subscriptionStatus}`)
        console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'None'}`)
        console.log(`Subscription Ends: ${user.subscriptionEnds || 'N/A'}`)
        console.log(`Quote Count: ${user.quoteCount}`)
    })

    // If you want to manually set a user to PRO for testing:
    // Uncomment and replace YOUR_USER_ID with your actual Clerk user ID
    /*
    const userId = 'YOUR_USER_ID'; 
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'PRO',
        subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    });
    console.log('\n=== Updated User ===')
    console.log(updated);
    */
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
