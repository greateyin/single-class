import { db } from '@/db';
import { courses, lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Creating test course and lesson...');

    // 1. Create Course
    const courseTitle = 'Test Course 101';
    let course = await db.query.courses.findFirst({
        where: eq(courses.title, courseTitle),
    });

    if (!course) {
        console.log('Creating course...');
        const [newCourse] = await db.insert(courses).values({
            title: courseTitle,
            description: 'A test course for multi-course architecture.',
            priceCents: 1000,
            isPublished: true,
        }).returning();
        course = newCourse;
    } else {
        console.log('Course already exists.');
    }

    // 2. Create Lesson
    const lessonTitle = 'Intro to Testing';
    let lesson = await db.query.lessons.findFirst({
        where: eq(lessons.title, lessonTitle),
    });

    if (!lesson) {
        console.log('Creating lesson...');
        await db.insert(lessons).values({
            title: lessonTitle,
            orderIndex: 1,
            videoEmbedUrl: 'https://player.vimeo.com/video/123456789',
            description: 'Introduction to testing.',
            courseId: course!.id,
            slug: 'intro-to-testing',
        });
    } else {
        console.log('Lesson already exists.');
        // Ensure it's linked to the course
        if (lesson.courseId !== course!.id) {
            console.log('Linking lesson to course...');
            await db.update(lessons).set({ courseId: course!.id }).where(eq(lessons.id, lesson.id));
        }
    }

    console.log('Test data created.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
