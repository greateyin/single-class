import 'dotenv/config';
import { db } from '../src/db';
import { users, transactions } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function checkDb() {
    console.log('Checking DB...');
    try {
        console.error('Connecting to DB...');
        const result = await db.execute('SELECT 1');
        console.error('DB Connection OK:', result);

        const email = 'test-verification@example.com';
        console.error('Querying user:', email);
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        console.error('User Result:', JSON.stringify(user, null, 2));

        if (user) {
            const userTransactions = await db.query.transactions.findMany({
                where: eq(transactions.userId, user.id),
            });
            console.error('Transactions:', JSON.stringify(userTransactions, null, 2));
        }
    } catch (error) {
        console.error('DB Error:', error);
    }
    process.exit(0);
}

checkDb();
