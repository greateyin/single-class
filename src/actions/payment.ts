'use server';

import { redirect } from 'next/navigation';
import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';

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

export async function handleOneClickUpsell() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    // 1. Get Customer ID
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user?.stripeCustomerId) {
        console.error('No Stripe Customer ID found for One-Click Upsell');
        redirect('/downsell'); // Fallback if no card on file
    }

    try {
        // 2. Create PaymentIntent Off-Session
        const paymentIntent = await stripe.paymentIntents.create({
            amount: PRICES.upsell,
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: 'pm_card_visa', // TEST MODE ONLY: Force success. In prod, retrieve default payment method.
            // In production, you would list payment methods and pick the default one:
            // const paymentMethods = await stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' });
            // payment_method: paymentMethods.data[0].id,
            off_session: true,
            confirm: true,
            metadata: {
                userId,
                offerType: 'upsell',
            },
            description: 'Single Class Platform - Advanced Module (Upsell)',
        });

        if (paymentIntent.status === 'succeeded') {
            // Webhook will handle DB insertion, but we can do optimistic update or wait.
            // For speed, let's just redirect to confirmation.
            redirect('/confirmation');
        } else {
            // Handle authentication required (3D Secure)
            console.warn('Payment requires action', paymentIntent.status);
            redirect('/downsell'); // Or show error
        }
    } catch (error) {
        console.error('Upsell Failed:', error);
        redirect('/downsell');
    }
}

export async function handleDownsellPurchase() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    // For Downsell, we can also try one-click if they have a customer ID, 
    // or send them to a new Checkout Session if we want to be safe.
    // Let's try One-Click for consistency.

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user?.stripeCustomerId) {
        // Fallback to Checkout if no customer ID
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Single Class Platform - Lite Pack' },
                    unit_amount: PRICES.downsell,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/downsell`,
            metadata: { userId, offerType: 'downsell' },
        });
        if (checkoutSession.url) redirect(checkoutSession.url);
        return;
    }

    try {
        await stripe.paymentIntents.create({
            amount: PRICES.downsell,
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: 'pm_card_visa', // TEST MODE ONLY
            off_session: true,
            confirm: true,
            metadata: { userId, offerType: 'downsell' },
        });
        redirect('/confirmation');
    } catch (error) {
        console.error('Downsell Failed:', error);
        redirect('/confirmation'); // Or error page
    }
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
