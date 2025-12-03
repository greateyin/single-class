import fs from 'fs';
import path from 'path';
import { hash } from 'bcrypt';

// Load .env manually BEFORE importing db
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading env from: ${envPath}`);
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

async function main() {
    const { db } = await import('../src/db');
    const { users } = await import('../src/db/schema');
    const { eq } = await import('drizzle-orm');

    const email = 'dennis.yin@gmail.com';
    const password = 'admin123';
    const hashedPassword = await hash(password, 10);

    console.log(`Seeding admin user: ${email}`);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        console.log('User already exists. Updating role and password...');
        await db.update(users)
            .set({
                role: 'admin',
                hashedPassword: hashedPassword,
                name: 'Test Admin',
            })
            .where(eq(users.email, email));
    } else {
        console.log('Creating new admin user...');
        await db.insert(users).values({
            id: crypto.randomUUID(),
            email,
            name: 'Test Admin',
            role: 'admin',
            hashedPassword: hashedPassword,
        });
    }

    console.log('✅ Admin user seeded successfully!');
    process.exit(0);
}

main().catch((err) => {
    console.error('Error seeding admin:', err);
    process.exit(1);
});
