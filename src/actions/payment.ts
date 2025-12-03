'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { transactions, users, courses } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';

const PRICES = {
    core: 9700, // $97.00
    upsell: 4700, // $47.00
    downsell: 2700, // $27.00
};

export async function createCoreCheckoutSession(courseId: string) {
    const session = await auth();
    console.log('createCoreCheckoutSession Session:', session);
    const userId = session?.user?.id;
    console.log('createCoreCheckoutSession User ID:', userId);

    // Fetch course details to get price and title
    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        throw new Error('Course not found');
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: course.title,
                        description: course.description || 'Online Course',
                    },
                    unit_amount: course.priceCents,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upsell?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`, // Pass courseId for context if needed
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}`,
        customer_email: session?.user?.email || undefined,
        metadata: {
            userId: userId || '', // Empty string if guest
            offerType: 'core',
            courseId: courseId,
        },
        payment_intent_data: {
            setup_future_usage: 'off_session', // Save card for upsells
            metadata: {
                userId: userId || '',
                offerType: 'core',
                courseId: courseId,
            }
        }
    });

    if (!checkoutSession.url) {
        throw new Error('Failed to create checkout session');
    }

    redirect(checkoutSession.url);
}

export async function handleOneClickCharge(offer: 'upsell' | 'downsell', courseId: string | null | undefined, formData: FormData) {
    const session = await enforceAuthentication();
    const userId = session.user.id;
    // For now, use fixed prices or fetch from courseId if provided
    // If courseId is provided, fetch price. Else fallback to constants.
    let amount = offer === 'upsell' ? PRICES.upsell : PRICES.downsell;

    if (courseId) {
        const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
        if (course) {
            amount = course.priceCents;
        }
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user?.stripeCustomerId) {
        console.error('No Stripe Customer ID found for One-Click Charge');
        if (offer === 'upsell') redirect('/downsell');
        redirect('/confirmation');
    }

    // MOCK LOGIC FOR DEV/TEST
    if (user.stripeCustomerId.startsWith('cus_test_')) {
        console.log(`[Mock] Processing one-click ${offer} for ${user.stripeCustomerId}`);
        // Simulate success
        await fulfillOrder(userId, offer, `pi_mock_${offer}_${Date.now()}`, 'stripe', user.stripeCustomerId, courseId || undefined);

        redirect('/confirmation');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: 'pm_card_visa', // In prod, use default payment method
            off_session: true,
            confirm: true,
            metadata: {
                userId,
                offerType: offer,
                courseId: courseId ? courseId : '',
            },
            description: `Single Class Platform - ${offer === 'upsell' ? 'Advanced Module' : 'Lite Pack'}`,
        });

        if (paymentIntent.status === 'succeeded') {
            redirect('/confirmation');
        } else {
            console.warn('Payment requires action', paymentIntent.status);
            if (offer === 'upsell') redirect('/downsell');
            redirect('/confirmation');
        }
    } catch (error) {
        console.error(`${offer} Failed:`, error);
        if (offer === 'upsell') redirect('/downsell');
        redirect('/confirmation');
    }
}

export async function rejectUpsell() {
    redirect('/downsell');
}

export async function getFunnelState() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    const lastTx = await db.query.transactions.findFirst({
        where: eq(transactions.userId, userId),
        orderBy: [desc(transactions.saleDate)],
    });

    return {
        hasCore: lastTx?.type === 'core' || lastTx?.type === 'upsell' || lastTx?.type === 'downsell',
        lastOffer: lastTx?.type,
    };
}
