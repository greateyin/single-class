import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'admin@example.com';
    console.log(`Checking role for ${email}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    console.log(`Current role: ${user.role}`);

    if (user.role !== 'admin') {
        console.log('Updating role to admin...');
        await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
        console.log('Role updated.');
    } else {
        console.log('User is already admin.');
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
