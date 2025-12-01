'use server';

import { redirect } from 'next/navigation';
import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';

const PRICES = {
    core: 9700, // $97.00
    upsell: 4700, // $47.00
    downsell: 2700, // $27.00
};

export async function createCoreCheckoutSession() {
    const session = await enforceAuthentication();
    console.log('createCoreCheckoutSession Session:', session);
    const userId = session.user.id;
    console.log('createCoreCheckoutSession User ID:', userId);

    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Single Class Platform - Core Course',
                        description: 'The Ultimate Guide to Single Class Architecture',
                    },
                    unit_amount: PRICES.core,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upsell?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/core`,
        customer_email: session.user.email || undefined,
        metadata: {
            userId,
            offerType: 'core',
        },
        payment_intent_data: {
            setup_future_usage: 'off_session', // Save card for upsells
            metadata: {
                userId,
                offerType: 'core',
            }
        }
    });

    if (!checkoutSession.url) {
        throw new Error('Failed to create checkout session');
    }

    redirect(checkoutSession.url);
}

export async function handleOneClickCharge(offer: 'upsell' | 'downsell') {
    const session = await enforceAuthentication();
    const userId = session.user.id;
    const amount = offer === 'upsell' ? PRICES.upsell : PRICES.downsell;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user?.stripeCustomerId) {
        console.error('No Stripe Customer ID found for One-Click Charge');
        // If downsell fails, maybe just go to confirmation or show error?
        // If upsell fails, go to downsell?
        if (offer === 'upsell') redirect('/downsell');
        redirect('/confirmation');
    }

    // MOCK LOGIC FOR DEV/TEST
    if (user.stripeCustomerId.startsWith('cus_test_')) {
        console.log(`[Mock] Processing one-click ${offer} for ${user.stripeCustomerId}`);
        // Simulate success
        await fulfillOrder(userId, offer, `pi_mock_${offer}_${Date.now()}`, 'stripe', user.stripeCustomerId);
        revalidateTag('user-purchases');
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
            },
            description: `Single Class Platform - ${offer === 'upsell' ? 'Advanced Module' : 'Lite Pack'}`,
        });

        if (paymentIntent.status === 'succeeded') {
            // Webhook handles fulfillment usually, but for immediate UI feedback we can redirect.
            // Ideally we wait for webhook, but optimistic success is fine.
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
