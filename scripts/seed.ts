import { db } from '@/db';
import { courses } from '@/db/schema';
// import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('🌱 Seeding database...');

    try {
        // 1. Seed Course
        const existingCourse = await db.query.courses.findFirst();
        if (!existingCourse) {
            console.log('Creating default course...');
            await db.insert(courses).values({
                title: 'Single Class Mastery',
                description: 'The ultimate guide to mastering this subject.',
                priceCents: 9700, // $97.00
                isPublished: true,
                imageUrl: 'https://placehold.co/600x400',
            });
            console.log('✅ Default course created.');
        } else {
            console.log('ℹ️ Course already exists. Skipping.');
        }

        // 2. Seed Admin User (Optional - change email/password as needed)
        // Note: In production, you might want to create this manually or via a secure setup page.
        // For now, we'll just log a reminder.
        console.log('ℹ️ Remember to create an admin user via the /api/auth/signin page or manually in the DB.');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }

    console.log('🌱 Seeding finished.');
    process.exit(0);
}

main();
