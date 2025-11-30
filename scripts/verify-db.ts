import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        console.log('Verifying database connection...');
        const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

        console.log('Tables found:', result.rows.map((r: any) => r.table_name));

        if (result.rows.length > 0) {
            console.log('✅ Database verification successful!');
        } else {
            console.error('❌ No tables found. Migration might have failed.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Database verification failed:', error);
        process.exit(1);
    }
}

main();
