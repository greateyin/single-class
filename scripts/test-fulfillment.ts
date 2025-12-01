import { fulfillOrder } from '@/lib/fulfillment';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    console.log(`Testing Upsell Fulfillment for ${email}...`);

    // Simulate Upsell Fulfillment
    await fulfillOrder(
        user.id,
        'upsell',
        `pi_test_upsell_${Date.now()}`,
        'stripe',
        user.stripeCustomerId
    );

    console.log('Fulfillment function executed.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
