import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    console.log('Listing users...');
    const allUsers = await db.query.users.findMany();
    console.log(allUsers);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
