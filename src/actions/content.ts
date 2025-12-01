'use server';

import { db } from '@/db';
import { lessons, lessonCompletion, attachments, assessments, userAttempts, qaMessages, users } from '@/db/schema';
import { enforcePaidAccess, enforceAuthentication } from '@/lib/auth-guards';
import { eq, and, asc, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- Lesson Access & Progress ---

export async function getCourseLessons(courseId: number) {
    const session = await enforcePaidAccess(courseId);
    const userId = session.user.id;

    // Fetch all lessons ordered by index
    const allLessons = await db.query.lessons.findMany({
        where: eq(lessons.courseId, courseId),
        orderBy: [asc(lessons.orderIndex)],
    });

    // Fetch completion status for the user
    const completed = await db.query.lessonCompletion.findMany({
        where: eq(lessonCompletion.userId, userId),
    });

    const completedSet = new Set(completed.map(c => c.lessonId));

    // Map to student view model
    return allLessons.map(lesson => ({
        ...lesson,
        isCompleted: completedSet.has(lesson.id),
        isLocked: false, // For now, all lessons are unlocked if paid. Could implement sequential unlock here.
    }));
}

export async function getLessonDetails(lessonId: number) {
    // 1. Fetch lesson first to identify course
    const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            attachments: true,
            assessments: true,
        }
    });

    if (!lesson) return null;

    // 2. Enforce Access for this specific course
    const session = await enforcePaidAccess(lesson.courseId!);
    const userId = session.user.id;

    // Check completion
    const completion = await db.query.lessonCompletion.findFirst({
        where: and(
            eq(lessonCompletion.userId, userId),
            eq(lessonCompletion.lessonId, lessonId)
        )
    });

    // Check assessment attempts
    const attempts = await db.query.userAttempts.findMany({
        where: and(
            eq(userAttempts.userId, userId),
            // We need to filter by assessment IDs belonging to this lesson
            // But userAttempts links to assessmentId. 
            // We can fetch attempts for the assessments in this lesson.
        ),
        with: {
            assessment: true
        }
    });

    // Filter attempts for this lesson's assessments
    const lessonAssessmentIds = new Set(lesson.assessments.map(a => a.id));
    const relevantAttempts = attempts.filter(a => lessonAssessmentIds.has(a.assessmentId));

    // Sanitize assessments (remove correct answer from client payload if strictly needed, 
    // but for simple app, maybe okay. Best practice: don't send correct answer).
    const sanitizedAssessments = lesson.assessments.map(a => ({
        id: a.id,
        questionText: a.questionText,
        // Omit correctAnswer
    }));

    return {
        ...lesson,
        isCompleted: !!completion,
        assessments: sanitizedAssessments,
        attempts: relevantAttempts
    };
}

export async function markLessonCompleted(lessonId: number) {
    const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
    if (!lesson || !lesson.courseId) return;

    const session = await enforcePaidAccess(lesson.courseId);
    const userId = session.user.id;

    await db.insert(lessonCompletion).values({
        userId,
        lessonId,
    }).onConflictDoNothing();

    revalidatePath('/dashboard');
    revalidatePath(`/lessons/${lessonId}`);
}

// --- Attachments ---

export async function getSecureAttachmentUrl(attachmentId: number) {
    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
        with: { lesson: true }
    });

    if (!attachment || !attachment.lesson || !attachment.lesson.courseId) {
        throw new Error('Attachment not found');
    }

    const session = await enforcePaidAccess(attachment.lesson.courseId);

    // In a real scenario with private blobs, we would generate a signed URL here.
    // For Vercel Blob (public access + obscurity), we just return the URL 
    // BUT we gate this function with enforcePaidAccess so only paid users can get the URL.
    // The frontend should not expose the URL directly in the DOM until the user clicks "Download".

    return attachment.storageUrl;
}

// --- Assessments ---

export async function submitAssessment(lessonId: number, formData: FormData) {
    const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
    if (!lesson || !lesson.courseId) return;

    const session = await enforcePaidAccess(lesson.courseId);
    const userId = session.user.id;

    const assessmentId = parseInt(formData.get('assessmentId') as string);
    const answer = formData.get('answer') as string;

    if (!assessmentId || !answer) {
        return;
    }

    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, assessmentId)
    });

    if (!assessment) return;

    const isCorrect = assessment.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
    const score = isCorrect ? 100 : 0;

    await db.insert(userAttempts).values({
        userId,
        assessmentId,
        score,
        attemptedAt: new Date(),
    });

    revalidatePath(`/lessons/${lessonId}`);
}

// --- Q&A ---

export async function getQaMessages(lessonId?: number) {
    if (lessonId) {
        const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
        if (!lesson || !lesson.courseId) return [];
        await enforcePaidAccess(lesson.courseId);
    } else {
        await enforceAuthentication();
    }

    // Fetch messages with author info
    const messages = await db.query.qaMessages.findMany({
        where: lessonId ? eq(qaMessages.lessonId, lessonId) : undefined,
        with: {
            author: true,
            lesson: true, // Include lesson details
        },
        orderBy: [desc(qaMessages.createdAt)], // Newest first for global view, client can reverse for thread
    });

    return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        parentId: msg.parentId,
        authorName: msg.author.name || msg.author.email,
        authorRole: msg.author.role,
        lessonTitle: msg.lesson.title,
        lessonId: msg.lesson.id,
    }));
}

export async function submitQaMessage(lessonId: number, formData: FormData) {
    const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
    if (!lesson || !lesson.courseId) return;

    const session = await enforcePaidAccess(lesson.courseId);
    const userId = session.user.id;

    const content = formData.get('content') as string;
    const parentIdStr = formData.get('parentId') as string;
    const parentId = parentIdStr ? parseInt(parentIdStr) : null;

    if (!content) return;

    await db.insert(qaMessages).values({
        authorId: userId,
        lessonId,
        content,
        parentId,
    });

    revalidatePath(`/lessons/${lessonId}`);
}
