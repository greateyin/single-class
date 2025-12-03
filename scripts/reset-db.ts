import fs from 'fs';
import path from 'path';

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
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 10) + '...');
} else {
    console.error('❌ DATABASE_URL is missing!');
    process.exit(1);
}

// Dynamic import to ensure env is loaded first
import { sql } from 'drizzle-orm';

async function main() {
    const { db } = await import('../src/db');
    console.log('🗑️ Dropping all tables...');

    // Disable foreign key checks to allow dropping in any order (if supported, or just drop in order)
    // Postgres doesn't have a simple "SET FOREIGN_KEY_CHECKS = 0", so we drop with CASCADE.

    const tables = [
        'user_attempts',
        'assessments',
        'qa_messages',
        'attachments',
        'lesson_completion',
        'transactions',
        'lessons',
        'courses',
        'users',
        'sales_periods',
    ];

    for (const table of tables) {
        try {
            await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE;`));
            console.log(`Dropped table: ${table}`);
        } catch (error) {
            console.error(`Failed to drop table ${table}:`, error);
        }
    }

    console.log('✅ Database reset complete!');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Reset failed:', err);
    process.exit(1);
});
