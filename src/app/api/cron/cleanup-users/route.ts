import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Optional: Check for authorization (e.g., CRON_SECRET)
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const result = await prisma.user.deleteMany({
            where: {
                deletedAt: {
                    lte: fifteenDaysAgo,
                },
            },
        });

        console.log(`Cleanup job: Deleted ${result.count} users.`);

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            message: `Successfully deleted ${result.count} users marked for deletion older than 15 days.`,
        });

    } catch (error) {
        console.error('Error during user cleanup:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
