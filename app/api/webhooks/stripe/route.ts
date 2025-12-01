import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';

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
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // 2. Handle Events
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const session = event.data.object as any;
        const { userId, offerType, courseId } = session.metadata;

        // For PaymentIntents, customer is a direct field. For Checkout Sessions, it might be in customer_details or customer.
        // We prioritize the 'customer' field which is the ID.
        const customerRef = session.customer as string | null;

        if (!userId || !offerType) {
            console.error('Missing metadata in webhook event');
            return new NextResponse('Missing metadata', { status: 400 });
        }

        try {
            await fulfillOrder(
                userId,
                offerType,
                session.payment_intent || session.id, // Use PI ID or Session ID as ref
                'stripe',
                customerRef,
                courseId ? parseInt(courseId) : undefined
            );
            return NextResponse.json({ received: true });
        } catch (error) {
            console.error('Fulfillment failed:', error);
            return new NextResponse('Fulfillment failed.', { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
