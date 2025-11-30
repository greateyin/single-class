
import 'dotenv/config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hash } from 'bcrypt';

async function main() {
    console.log('Seeding test user...');
    const hashedPassword = await hash('password123', 10);

    try {
        await db.insert(users).values({
            id: 'test-user-verification',
            email: 'test-verification@example.com',
            role: 'student',
            hashedPassword,
        }).onConflictDoUpdate({
            target: users.email,
            set: { hashedPassword }
        });
        console.log('Test user seeded successfully: test-verification@example.com / password123');
    } catch (error) {
        console.error('Error seeding test user:', error);
    }
    process.exit(0);
}

main();
