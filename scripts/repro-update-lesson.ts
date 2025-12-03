import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';

async function main() {
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

    const { db } = await import('@/db');
    const { lessons } = await import('@/db/schema');

    const lessonId = 'd85de37c-bc30-4f5b-afcc-518c924a282e';
    console.log(`Checking lesson: ${lessonId}`);

    const lessonBefore = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
    });

    if (!lessonBefore) {
        console.error('Lesson not found!');
        process.exit(1);
    }
    console.log('Lesson before update:', lessonBefore.title, lessonBefore.orderIndex);

    const newTitle = `Updated Title ${Date.now()}`;
    const newOrderIndex = (lessonBefore.orderIndex || 0) + 1;

    console.log(`Attempting to update to: "${newTitle}", Order: ${newOrderIndex}`);

    try {
        const result = await db.update(lessons)
            .set({
                title: newTitle,
                orderIndex: newOrderIndex,
            })
            .where(eq(lessons.id, lessonId))
            .returning();

        console.log('Update result:', result);
    } catch (error) {
        console.error('Update failed:', error);
    }

    const lessonAfter = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
    });

    console.log('Lesson after update:', lessonAfter?.title, lessonAfter?.orderIndex);

    if (lessonAfter?.title === newTitle) {
        console.log('SUCCESS: DB Update worked.');
    } else {
        console.error('FAILURE: DB Update did not persist.');
    }

    process.exit(0);
}

main();
