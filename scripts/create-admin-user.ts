import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
    const email = 'admin@example.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creating admin user ${email}...`);

    // Check if exists
    const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existing) {
        console.log('User already exists. Updating password and role...');
        await db.update(users).set({
            hashedPassword,
            role: 'admin',
        }).where(eq(users.id, existing.id));
    } else {
        console.log('Creating new user...');
        await db.insert(users).values({
            email,
            hashedPassword,
            role: 'admin',
            id: crypto.randomUUID(),
        });
    }

    console.log('Admin user created/updated.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
