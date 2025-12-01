import { db } from '@/db';
import { users } from '@/db/schema';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'dennis.yin@gmail.com';
    const password = 'admin123';
    const name = 'Dennis Yin';

    console.log('🔐 Creating admin user...');

    try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existingUser) {
            console.log('ℹ️ User already exists with ID:', existingUser.id);
            console.log('Current role:', existingUser.role);

            if (existingUser.role !== 'admin') {
                console.log('Updating role to admin...');
                await db.update(users)
                    .set({ role: 'admin' })
                    .where(eq(users.id, existingUser.id));
                console.log('✅ Role updated to admin.');
            }

            process.exit(0);
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create admin user
        const newUser = await db.insert(users).values({
            id: uuidv4(),
            email: email,
            name: name,
            hashedPassword: hashedPassword,
            role: 'admin',
        }).returning();

        console.log('');
        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('🆔 ID:', newUser[0].id);
        console.log('');
        console.log('⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Failed to create admin user:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
