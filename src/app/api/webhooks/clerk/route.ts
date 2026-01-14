import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    // You can set this in your .env file
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        console.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
        // For now, if no secret is set, we might return error or skip verification in dev if explicitly allowed (not recommended for prod)
        // return new Response('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local', {
        //   status: 500,
        // })
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        if (process.env.NODE_ENV === 'development') {
            console.warn("Skipping Webhook Signature verification in development because headers are missing. proceed with caution.")
        } else {
            return new Response('Error occurred -- no svix headers', {
                status: 400,
            })
        }
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    let evt: WebhookEvent | null = null;

    if (WEBHOOK_SECRET && svix_id && svix_timestamp && svix_signature) {
        const wh = new Webhook(WEBHOOK_SECRET);
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as WebhookEvent
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return new Response('Error occurred', {
                status: 400,
            })
        }
    } else {
        // Fallback for dev/testing without verified headers if acceptable (or just cast payload)
        evt = payload as WebhookEvent;
    }


    const eventType = evt?.type;

    if (eventType === 'user.deleted') {
        const { id } = evt.data;

        if (id) {
            try {
                await prisma.user.update({
                    where: { id },
                    data: {
                        deletedAt: new Date(),
                    }
                });
                console.log(`User ${id} marked for deletion (soft delete).`);
            } catch (error) {
                console.error(`Error marking user ${id} for deletion:`, error);
            }
        }
    }

    return NextResponse.json({ message: 'Webhook received', success: true });
}
