import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    const txs = await db.query.transactions.findMany({
        where: eq(transactions.userId, user.id),
        orderBy: [desc(transactions.saleDate)],
    });

    console.log(`Transactions for ${email}:`);
    txs.forEach(tx => {
        console.log(`- ${tx.type}: ${tx.amountCents} cents (${tx.status})`);
    });

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
