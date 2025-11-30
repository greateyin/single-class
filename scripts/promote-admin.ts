import 'dotenv/config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function promoteToAdmin(email: string) {
    console.log(`Promoting ${email} to admin...`);

    try {
        await db.update(users)
            .set({ role: 'admin' })
            .where(eq(users.email, email));

        console.log(`Successfully promoted ${email} to admin.`);
    } catch (error) {
        console.error('Failed to promote user:', error);
    }
    process.exit(0);
}

promoteToAdmin('test-verification@example.com');
