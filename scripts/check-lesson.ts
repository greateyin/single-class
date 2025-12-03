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
    const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
    });

    if (lesson) {
        console.log('Lesson found:', lesson.title);
    } else {
        console.log('Lesson not found');
    }
    process.exit(0);
}

main();
