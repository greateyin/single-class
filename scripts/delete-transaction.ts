import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function main() {
    const userEmail = 'student@example.com';
    const courseId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual UUID

    console.log(`Deleting transaction for ${userEmail} - courseId ${courseId}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, userEmail),
    });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    await db.delete(transactions).where(and(
        eq(transactions.userId, user.id),
        eq(transactions.courseId, courseId)
    ));

    console.log('Transaction deleted.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
