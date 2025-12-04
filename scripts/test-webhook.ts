// import { stripe } from '@/lib/stripe';
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

    console.log(`Testing Webhook for ${email}...`);

    const payload = {
        id: `evt_test_${Date.now()}`,
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
            object: {
                id: `pi_webhook_test_${Date.now()}`,
                object: 'payment_intent',
                amount: 4700,
                currency: 'usd',
                status: 'succeeded',
                customer: user.stripeCustomerId || 'cus_test_webhook',
                metadata: {
                    userId: user.id,
                    offerType: 'upsell',
                },
            },
        },
    };

    const payloadString = JSON.stringify(payload, null, 2);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
        console.error('STRIPE_WEBHOOK_SECRET is missing');
        process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const stripe = require('stripe');
    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret,
    });

    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': header,
        },
        body: payloadString,
    });

    if (response.ok) {
        console.log('Webhook delivered successfully!');
    } else {
        console.error(`Webhook failed: ${response.status} ${response.statusText}`);
        console.error(await response.text());
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
