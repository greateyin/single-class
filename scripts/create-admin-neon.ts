import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

// Define schema inline
const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    hashedPassword: text('hashed_password'),
    role: text('role').notNull(),
});

async function main() {
    const email = 'dennis.yin@gmail.com';
    const password = 'admin123';
    const name = 'Dennis Yin';

    // Use DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not set!');
        process.exit(1);
    }

    console.log('🔐 Creating admin user in Neon database...');
    console.log('Database:', databaseUrl.substring(0, 50) + '...');
    console.log('');

    const sql = neon(databaseUrl);
    const db = drizzle({ client: sql });

    try {
        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, email));

        if (existing.length > 0) {
            console.log('ℹ️  User already exists:', existing[0].id);
            console.log('Role:', existing[0].role);

            if (existing[0].role !== 'admin') {
                await db.update(users)
                    .set({ role: 'admin' })
                    .where(eq(users.id, existing[0].id));
                console.log('✅ Role updated to admin');
            }

            console.log('');
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password);
            console.log('🆔 ID:', existing[0].id);

            process.exit(0);
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create user
        const newId = uuidv4();
        await db.insert(users).values({
            id: newId,
            email: email,
            name: name,
            hashedPassword: hashedPassword,
            role: 'admin',
        });

        console.log('✅ Admin user created!');
        console.log('');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('🆔 ID:', newId);
        console.log('');
        console.log('⚠️  Please change password after first login!');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
