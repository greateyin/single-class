import 'dotenv/config';
import { db } from '@/db';
import { courses } from '@/db/schema';

async function main() {
    console.log('Checking for courses...');
    try {
        const allCourses = await db.select().from(courses);
        console.log('Courses found:', allCourses.length);
        if (allCourses.length === 0) {
            console.log('No courses found. Seeding required.');
        } else {
            console.log('Courses exist:', allCourses);
        }
    } catch (error) {
        console.error('Failed to query courses:', error);
    }
    process.exit(0);
}

main();
