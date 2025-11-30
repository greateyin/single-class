'use server';

import { db } from '@/db';
import { lessons, lessonCompletion } from '@/db/schema';
import { enforcePaidAccess } from '@/lib/auth-guards';
import { eq, asc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCourseContent() {
    const session = await enforcePaidAccess();
    const userId = session.user.id;

    // Fetch all lessons
    const allLessons = await db.query.lessons.findMany({
        orderBy: [asc(lessons.orderIndex)],
    });

    // Fetch user progress
    const completedLessons = await db.query.lessonCompletion.findMany({
        where: eq(lessonCompletion.userId, userId),
    });

    const completedSet = new Set(completedLessons.map(l => l.lessonId));

    return {
        lessons: allLessons.map(lesson => ({
            ...lesson,
            isCompleted: completedSet.has(lesson.id),
        })),
        progress: (completedSet.size / allLessons.length) * 100 || 0,
    };
}

export async function getLesson(lessonId: number) {
    const session = await enforcePaidAccess();
    const userId = session.user.id;

    const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
    });

    if (!lesson) return null;

    const completion = await db.query.lessonCompletion.findFirst({
        where: and(
            eq(lessonCompletion.userId, userId),
            eq(lessonCompletion.lessonId, lessonId)
        ),
    });

    return {
        ...lesson,
        isCompleted: !!completion,
    };
}

export async function markLessonComplete(lessonId: number) {
    const session = await enforcePaidAccess();
    const userId = session.user.id;

    await db.insert(lessonCompletion)
        .values({
            userId,
            lessonId,
        })
        .onConflictDoNothing();

    revalidatePath('/(course)', 'layout');
}
