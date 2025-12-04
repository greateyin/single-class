import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';
import Stripe from 'stripe';

// Disable Next.js body parsing to allow signature verification
// Note: In App Router, bodyParser is disabled by default for Route Handlers when reading the body manually.


export async function POST(req: Request) {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    let event;

    // 1. Signature Verification
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Webhook signature verification failed: ${errorMessage}`);
        return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // 2. Handle Events
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const session = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
        const metadata = session.metadata || {};
        const { userId, offerType, courseId } = metadata;

        let customerRef: string | null = null;
        let customerEmail: string | null = null;
        let paymentIntentId: string | null = null;

        if (event.type === 'checkout.session.completed') {
            const checkoutSession = session as Stripe.Checkout.Session;
            customerRef = checkoutSession.customer as string | null;
            customerEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email || null;
            paymentIntentId = checkoutSession.payment_intent as string | null || checkoutSession.id;
        } else {
            const paymentIntent = session as Stripe.PaymentIntent;
            customerRef = paymentIntent.customer as string | null;
            paymentIntentId = paymentIntent.id;
            // PaymentIntent might not have email directly, usually passed in metadata or we rely on userId
        }

        if ((!userId && !customerEmail) || !offerType) {
            console.error('Missing metadata or email in webhook event');
            return new NextResponse('Missing metadata or email', { status: 400 });
        }

        try {
            await fulfillOrder(
                userId || null, // Pass null if empty string
                offerType as "core" | "upsell" | "downsell",
                paymentIntentId!, // Use PI ID or Session ID as ref
                'stripe',
                customerRef,
                courseId || undefined,
                customerEmail || undefined
            );
            return NextResponse.json({ received: true });
        } catch (error) {
            console.error('Fulfillment failed:', error);
            return new NextResponse('Fulfillment failed.', { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
