'use server';

import { redirect } from 'next/navigation';
import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';

// Mock Prices (In real app, fetch from DB or Stripe)
const PRICES = {
    core: 9700, // $97.00
    upsell: 4700, // $47.00
    downsell: 2700, // $27.00
};

export async function createCoreCheckoutSession() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    // MOCK: Simulate Stripe Checkout creation
    console.log(`[MOCK] Creating Core Checkout for user ${userId}`);

    // In real implementation:
    // const stripeSession = await stripe.checkout.sessions.create({...})
    // redirect(stripeSession.url)

    // For testing, we simulate a successful redirect to a "mock payment" page
    // or directly to the success URL logic.
    // Let's simulate a direct fulfillment for now to unblock UI dev.

    await fulfillOrder(userId, 'core', `mock_pi_${Date.now()}`, 'stripe', `mock_cus_${userId}`);

    redirect('/upsell');
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
        redirect('/downsell'); // Fallback
    }

    // MOCK: Simulate Off-Session Payment Intent
    console.log(`[MOCK] Charging Upsell to ${user.stripeCustomerId}`);

    await fulfillOrder(userId, 'upsell', `mock_pi_upsell_${Date.now()}`, 'stripe', user.stripeCustomerId);

    redirect('/confirmation');
}

export async function handleDownsellPurchase() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    // MOCK: Simulate Downsell Charge (could be another checkout or one-click)
    console.log(`[MOCK] Charging Downsell for user ${userId}`);

    await fulfillOrder(userId, 'downsell', `mock_pi_downsell_${Date.now()}`, 'stripe', `mock_cus_${userId}`);

    redirect('/confirmation');
}

// Internal Fulfillment Logic (duplicated from webhook for mock)
async function fulfillOrder(userId: string, offerType: 'core' | 'upsell' | 'downsell', paymentIntentId: string, source: string, customerId: string) {
    // Idempotency check
    const existing = await db.query.transactions.findFirst({
        where: eq(transactions.paymentIntentId, paymentIntentId)
    });

    if (existing) return;

    await db.transaction(async (tx) => {
        await tx.insert(transactions).values({
            userId,
            amountCents: PRICES[offerType],
            status: 'completed',
            type: offerType,
            paymentIntentId,
            isVaulted: true, // Mocking that we saved the card
        });

        if (offerType === 'core') {
            await tx.update(users)
                .set({ stripeCustomerId: customerId })
                .where(eq(users.id, userId));
        }
    });

    revalidatePath('/', 'layout');
    // Actually, I'll just import revalidatePath and use that.
    // But I need to update the import first.
    // Let me just comment out revalidateTag for now to unblock build, as it's an optimization.
    // revalidateTag('user-purchases');
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
