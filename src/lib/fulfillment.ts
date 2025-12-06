import { db } from '@/db';
import { transactions, users, enrollments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { resend } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function fulfillOrder(
    userId: string | null | undefined,
    offerType: 'core' | 'upsell' | 'downsell',
    transactionRef: string,
    source: 'stripe' | 'paypal',
    customerRef: string | null,
    courseId?: string,
    userEmail?: string,
    receiptUrl?: string | null,
    currency: string = 'usd',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentDetails?: any
) {
    console.log(`Fulfilling order for ${userId || userEmail}, offer: ${offerType}, course: ${courseId}`);

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

    // 2. Resolve User (Auto-Registration)
    let targetUserId = userId;
    let isNewUser = false;

    if (!targetUserId && userEmail) {
        // A. Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, userEmail)
        });

        if (existingUser) {
            targetUserId = existingUser.id;
        } else {
            // B. Create new user
            const newUser = await db.insert(users).values({
                id: uuidv4(),
                email: userEmail,
                role: 'student',
                // No password set initially
            }).returning();
            targetUserId = newUser[0].id;
            isNewUser = true;
        }
    }

    if (!targetUserId) {
        throw new Error('Failed to resolve user for fulfillment');
    }

    // 3. DB Transaction
    await db.transaction(async (tx) => {
        // A. Record Transaction
        await tx.insert(transactions).values({
            userId: targetUserId!, // Assert non-null
            amountCents: offerType === 'core' ? 9700 : offerType === 'upsell' ? 4700 : 2700,
            status: 'completed',
            type: offerType,
            paymentIntentId: transactionRef,
            isVaulted: !!customerRef,
            courseId,
            provider: source,
            currency,
            receiptUrl: receiptUrl || null,
            paymentMethodDetails: paymentDetails || null,
        });

        // B. Update User (Save Stripe Customer ID for Core)
        if (offerType === 'core' && customerRef && source === 'stripe') {
            await tx.update(users)
                .set({ stripeCustomerId: customerRef })
                .where(eq(users.id, targetUserId!));
        }

        // C. Create Enrollment
        if (courseId) {
            // Check if already enrolled
            const existingEnrollment = await tx.query.enrollments.findFirst({
                where: and(
                    eq(enrollments.userId, targetUserId!),
                    eq(enrollments.courseId, courseId)
                )
            });

            if (!existingEnrollment) {
                await tx.insert(enrollments).values({
                    userId: targetUserId!,
                    courseId: courseId,
                    // enrolledAt defaults to now
                    // firstAccessedAt is null initially
                    // expiresAt is null initially (calculated on first access)
                });
            }
        }
    });

    // 4. Send Email (Resend)
    // Fetch user email if we only had ID
    const finalUserEmail = userEmail || (await db.query.users.findFirst({ where: eq(users.id, targetUserId) }))?.email;

    if (finalUserEmail) {
        try {
            // Order Confirmation
            await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>', // Update with verified domain in prod
                to: [finalUserEmail],
                subject: `Order Confirmed: ${offerType.toUpperCase()}`,
                html: `<p>Thank you for your purchase of the ${offerType} package!</p>`,
            });

            // Welcome Email for New Users
            if (isNewUser) {
                await resend.emails.send({
                    from: 'Acme <onboarding@resend.dev>',
                    to: [finalUserEmail],
                    subject: `Welcome to Single Class!`,
                    html: `
                        <h1>Welcome!</h1>
                        <p>Your account has been created.</p>
                        <p>Please <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signin">click here to log in</a>.</p>
                        <p>You can use your email to sign in via Magic Link (if configured) or reset your password.</p>
                    `,
                });
            }
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    }
}
