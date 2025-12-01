import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'dennis.yin@gmail.com';

    console.log('🔍 Checking remote database for user:', email);
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('');

    try {
        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (user) {
            console.log('✅ User found in database:');
            console.log('  - ID:', user.id);
            console.log('  - Email:', user.email);
            console.log('  - Name:', user.name);
            console.log('  - Role:', user.role);
            console.log('  - Has Password:', !!user.hashedPassword);
            console.log('  - Stripe Customer ID:', user.stripeCustomerId || 'None');
            console.log('  - Created At:', user.createdAt);
        } else {
            console.log('❌ User NOT found in database!');
            console.log('');
            console.log('Please run: npx tsx scripts/create-admin.ts');
        }

        // Also check total users count
        const allUsers = await db.select().from(users);
        console.log('');
        console.log('📊 Total users in database:', allUsers.length);

    } catch (error) {
        console.error('❌ Failed to query database:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
