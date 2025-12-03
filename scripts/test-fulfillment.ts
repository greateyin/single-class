import { fulfillOrder } from '@/lib/fulfillment';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function main() {
    const userEmail = 'student@example.com';
    const courseId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual UUID
    const txRef = `pi_test_fulfill_${Date.now()}`;

    console.log(`Testing fulfillment for ${userEmail} - courseId ${courseId}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, userEmail),
    });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    // Call fulfillOrder directly
    await fulfillOrder(
        user.id,
        'core',
        txRef,
        'stripe',
        'cus_test_123',
        courseId
    );

    // Verify in DB
    const tx = await db.query.transactions.findFirst({
        where: and(
            eq(transactions.paymentIntentId, txRef),
            eq(transactions.courseId, courseId)
        ),
    });

    if (tx) {
        console.log('Transaction verified in DB:', tx);
    } else {
        console.error('Transaction NOT found in DB!');
        process.exit(1);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
