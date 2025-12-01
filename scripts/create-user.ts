import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error('Usage: tsx scripts/create-user.ts <email> <password>');
        process.exit(1);
    }

    console.log(`Creating user ${email}...`);

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        console.log('User already exists. Updating password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.update(users)
            .set({ hashedPassword })
            .where(eq(users.email, email));
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insert(users).values({
            id: crypto.randomUUID(),
            email,
            hashedPassword,
            name: 'Test Student',
            role: 'student',
        });
    }

    console.log('User created/updated successfully');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
