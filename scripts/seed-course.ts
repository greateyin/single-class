import { db } from '../src/db';
import { lessons } from '../src/db/schema';

async function main() {
    console.log('Seeding course content...');

    const initialLessons = [
        {
            title: 'Welcome to the Course',
            slug: 'welcome',
            description: 'Introduction to the Single Class Platform architecture.',
            videoEmbedUrl: 'https://player.vimeo.com/video/76979871', // Dummy video
            orderIndex: 0,
            moduleId: 'module-1',
        },
        {
            title: 'Setting up the Environment',
            slug: 'setup',
            description: 'Installing Next.js, Tailwind, and Drizzle.',
            videoEmbedUrl: 'https://player.vimeo.com/video/76979871',
            orderIndex: 1,
            moduleId: 'module-1',
        },
        {
            title: 'Database Schema Design',
            slug: 'schema',
            description: 'Designing the schema for high performance.',
            videoEmbedUrl: 'https://player.vimeo.com/video/76979871',
            orderIndex: 2,
            moduleId: 'module-1',
        },
        {
            title: 'Authentication & Authorization',
            slug: 'auth',
            description: 'Implementing secure auth with Auth.js.',
            videoEmbedUrl: 'https://player.vimeo.com/video/76979871',
            orderIndex: 3,
            moduleId: 'module-2',
        },
        {
            title: 'Payments & Webhooks',
            slug: 'payments',
            description: 'Handling Stripe payments and webhooks.',
            videoEmbedUrl: 'https://player.vimeo.com/video/76979871',
            orderIndex: 4,
            moduleId: 'module-2',
        },
    ];

    for (const lesson of initialLessons) {
        await db.insert(lessons).values(lesson).onConflictDoNothing();
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
