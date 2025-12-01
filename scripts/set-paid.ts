import { db } from '@/db';
import { users, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    console.log(`Marking user ${email} as paid...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    await db.transaction(async (tx) => {
        await tx.update(users)
            .set({
                stripeCustomerId: 'cus_test_123',
            })
            .where(eq(users.email, email));

        await tx.insert(transactions).values({
            userId: user.id,
            amountCents: 19900,
            status: 'completed',
            type: 'core',
            paymentIntentId: `pi_mock_${Date.now()}`,
            isVaulted: true,
        });
    });

    console.log('User marked as paid successfully');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
