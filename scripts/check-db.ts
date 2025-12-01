import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Checking database connection...');
    try {
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:', result.rows.map((r: any) => r.table_name));
    } catch (error) {
        console.error('Failed to connect or query DB:', error);
    }
    process.exit(0);
}

main();
