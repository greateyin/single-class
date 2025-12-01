import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function fulfillOrder(
    userId: string,
    offerType: 'core' | 'upsell' | 'downsell',
    transactionRef: string,
    source: 'stripe' | 'paypal',
    customerRef: string | null
) {
    console.log(`Fulfilling order for ${userId}, offer: ${offerType}`);

    // 1. Idempotency Check
    const existingTx = await db.query.transactions.findFirst({
        where: and(
            eq(transactions.paymentIntentId, transactionRef),
            eq(transactions.status, 'completed')
        )
    });

    if (existingTx) {
        console.warn(`Idempotency: Transaction ${transactionRef} already fulfilled.`);
        return;
    }

    // 2. DB Transaction
    await db.transaction(async (tx) => {
        // A. Record Transaction
        await tx.insert(transactions).values({
            userId,
            amountCents: offerType === 'core' ? 9700 : offerType === 'upsell' ? 4700 : 2700,
            status: 'completed',
            type: offerType,
            paymentIntentId: transactionRef,
            isVaulted: !!customerRef,
        });

        // B. Update User (Save Stripe Customer ID for Core)
        if (offerType === 'core' && customerRef && source === 'stripe') {
            await tx.update(users)
                .set({ stripeCustomerId: customerRef })
                .where(eq(users.id, userId));
        }
    });

    // 3. Send Email (Resend)
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (user?.email) {
        try {
            await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>', // Update with verified domain in prod
                to: [user.email],
                subject: `Order Confirmed: ${offerType.toUpperCase()}`,
                html: `<p>Thank you for your purchase of the ${offerType} package!</p>`,
            });
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    }
}
