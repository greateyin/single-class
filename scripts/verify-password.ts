import { db } from '@/db';
import { users } from '@/db/schema';
import { compare } from 'bcrypt';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'dennis.yin@gmail.com';
    const testPassword = 'admin123';

    console.log('🔍 Verifying password for:', email);
    console.log('');

    try {
        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('✅ User found:', user.id);
        console.log('Has password hash:', !!user.hashedPassword);

        if (!user.hashedPassword) {
            console.log('❌ No password hash found! User cannot login with credentials.');
            process.exit(1);
        }

        // Test password
        const isValid = await compare(testPassword, user.hashedPassword);

        if (isValid) {
            console.log('✅ Password is CORRECT!');
            console.log('');
            console.log('Login credentials:');
            console.log('  Email:', email);
            console.log('  Password:', testPassword);
        } else {
            console.log('❌ Password is INCORRECT!');
            console.log('');
            console.log('The stored hash does not match the test password.');
            console.log('You may need to reset the password.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
