import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.userId;
        const offerType = session.metadata?.offerType;

        console.log('Webhook Session Metadata:', session.metadata);
        console.log('Webhook Session ID:', session.id);

        if (!userId || !offerType) {
            console.error('Missing metadata:', { userId, offerType });
            return new NextResponse('Webhook Error: Missing metadata', { status: 400 });
        }

        // Create Transaction
        await db.insert(transactions).values({
            userId,
            amountCents: session.amount_total || 0,
            status: 'completed',
            type: offerType as 'core' | 'upsell' | 'downsell',
            paymentIntentId: session.payment_intent as string,
            isVaulted: true, // Assuming we save cards by default in checkout settings
        }).onConflictDoNothing();

        // If Core offer, save Stripe Customer ID for future one-click upsells
        if (offerType === 'core' && session.customer) {
            await db.update(users)
                .set({ stripeCustomerId: session.customer as string })
                .where(eq(users.id, userId));
        }
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata?.userId;
        const offerType = paymentIntent.metadata?.offerType;

        // Only handle if metadata exists (Upsells might be created via PI directly)
        if (userId && offerType) {
            await db.insert(transactions).values({
                userId,
                amountCents: paymentIntent.amount,
                status: 'completed',
                type: offerType as 'core' | 'upsell' | 'downsell',
                paymentIntentId: paymentIntent.id,
                isVaulted: true,
            }).onConflictDoNothing();
        }
    }

    return new NextResponse(null, { status: 200 });
}
