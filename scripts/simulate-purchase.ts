import { db } from '@/db';
import { transactions, users, courses } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const userEmail = 'student@example.com';
    const courseTitle = 'Test Course 101';

    console.log(`Simulating purchase for ${userEmail} - ${courseTitle}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, userEmail),
    });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    const course = await db.query.courses.findFirst({
        where: eq(courses.title, courseTitle),
    });

    if (!course) {
        console.error('Course not found');
        process.exit(1);
    }

    await db.insert(transactions).values({
        userId: user.id,
        courseId: course.id,
        amountCents: course.priceCents,
        status: 'completed',
        type: 'core',
        paymentIntentId: `pi_sim_${Date.now()}`,
    });

    console.log('Transaction created successfully.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
