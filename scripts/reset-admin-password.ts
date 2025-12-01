import { db } from '@/db';
import { users } from '@/db/schema';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'dennis.yin@gmail.com';
    const newPassword = 'admin123';

    console.log('🔐 Resetting password for:', email);
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

        // Hash new password
        const hashedPassword = await hash(newPassword, 10);

        // Update password
        await db.update(users)
            .set({ hashedPassword: hashedPassword })
            .where(eq(users.id, user.id));

        console.log('✅ Password updated successfully!');
        console.log('');
        console.log('📧 Email:', email);
        console.log('🔑 New Password:', newPassword);
        console.log('🆔 User ID:', user.id);
        console.log('');
        console.log('⚠️  Please change this password after first login!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
