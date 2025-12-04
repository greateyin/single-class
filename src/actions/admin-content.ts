'use server';

import { put, del } from '@vercel/blob';
import { db } from '@/db';
import { lessons, attachments, assessments, userAttempts, lessonCompletion, qaMessages } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { eq, asc, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- Lesson Management ---

export async function getLessons(courseId?: string) {
    await enforceAdminRole();
    const whereClause = courseId ? eq(lessons.courseId, courseId) : undefined;

    return await db.query.lessons.findMany({
        where: whereClause,
        orderBy: [asc(lessons.orderIndex)],
        with: {
            attachments: true,
            assessments: true,
            course: true,
        }
    });
}

export async function getLessonById(id: string) {
    await enforceAdminRole();
    return await db.query.lessons.findFirst({
        where: eq(lessons.id, id),
        with: {
            attachments: true,
            assessments: true,
        }
    });
}

export async function createLesson(data: { title: string; orderIndex: number; videoEmbedUrl: string; description?: string; courseId?: string; moduleId?: string; downloadUrl?: string }) {
    await enforceAdminRole();

    await db.insert(lessons).values({
        title: data.title,
        orderIndex: data.orderIndex,
        videoEmbedUrl: data.videoEmbedUrl,
        description: data.description,
        courseId: data.courseId,
        moduleId: data.moduleId,
        downloadUrl: data.downloadUrl,
        slug: data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
    }).returning(); // Ensure returning if needed, though not used here

    revalidatePath('/admin/lessons');
    revalidatePath('/dashboard');
    if (data.courseId) {
        revalidatePath(`/admin/courses/${data.courseId}`);
    }
}

export async function updateLesson(id: string, data: { title?: string; videoEmbedUrl?: string; description?: string; orderIndex?: number; courseId?: string | null; moduleId?: string; downloadUrl?: string }) {
    await enforceAdminRole();

    try {
        await db.update(lessons)
            .set({
                ...data,
                slug: data.title ? data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : undefined,
            })
            .where(eq(lessons.id, id));
    } catch (error) {
        console.error('updateLesson error:', error);
        throw error;
    }

    revalidatePath('/admin/lessons');
    revalidatePath(`/admin/lessons/${id}`);
    revalidatePath('/dashboard');
}

export async function deleteLesson(id: string) {
    await enforceAdminRole();

    // Cascade delete related records manually if DB cascade isn't set up or to be safe
    // Note: In a real app, you might want soft delete or strict cascade rules.
    // For now, we'll delete related records to keep it clean.

    await db.delete(attachments).where(eq(attachments.lessonId, id));
    await db.delete(assessments).where(eq(assessments.lessonId, id));
    await db.delete(lessonCompletion).where(eq(lessonCompletion.lessonId, id));
    await db.delete(qaMessages).where(eq(qaMessages.lessonId, id));

    // Note: userAttempts links to assessments, so we should delete those first if we delete assessments
    // But wait, assessments are linked to lessons.
    // Let's find assessments for this lesson first to delete attempts.
    const lessonAssessments = await db.query.assessments.findMany({ where: eq(assessments.lessonId, id) });
    for (const assessment of lessonAssessments) {
        await db.delete(userAttempts).where(eq(userAttempts.assessmentId, assessment.id));
    }
    await db.delete(assessments).where(eq(assessments.lessonId, id));

    await db.delete(lessons).where(eq(lessons.id, id));

    revalidatePath('/admin/lessons');
    revalidatePath('/dashboard');
}

export async function reorderLessons(items: { id: string; orderIndex: number }[]) {
    await enforceAdminRole();

    // Use a transaction for safety
    await db.transaction(async (tx) => {
        for (const item of items) {
            await tx.update(lessons)
                .set({ orderIndex: item.orderIndex })
                .where(eq(lessons.id, item.id));
        }
    });

    revalidatePath('/admin/lessons');
    revalidatePath('/dashboard');
}

// --- Attachment Management ---

export async function uploadAttachment(lessonId: string, formData: FormData) {
    await enforceAdminRole();

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    let storageUrl = '';

    if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
            const blob = await put(file.name, file, {
                access: 'public',
            });
            storageUrl = blob.url;
        } catch (error) {
            console.error('Vercel Blob upload failed:', error);
            throw new Error('Upload failed');
        }
    } else {
        // Mock upload for development
        console.warn('BLOB_READ_WRITE_TOKEN not set. Using mock URL.');
        storageUrl = `https://mock-storage.com/${file.name}`;
    }

    await db.insert(attachments).values({
        lessonId,
        fileName: file.name,
        storageUrl,
    });

    await db.update(lessons).set({ hasAttachment: true }).where(eq(lessons.id, lessonId));

    revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function saveAttachmentMetadata(lessonId: string, fileName: string, storageUrl: string) {
    await enforceAdminRole();

    await db.insert(attachments).values({
        lessonId,
        fileName,
        storageUrl,
    });

    await db.update(lessons).set({ hasAttachment: true }).where(eq(lessons.id, lessonId));

    revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteAttachment(id: string) {
    await enforceAdminRole();

    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, id),
    });

    if (!attachment) return;

    if (process.env.BLOB_READ_WRITE_TOKEN && !attachment.storageUrl.includes('mock-storage')) {
        try {
            await del(attachment.storageUrl);
        } catch (error) {
            console.error('Vercel Blob delete failed:', error);
        }
    }

    await db.delete(attachments).where(eq(attachments.id, id));

    // Check if lesson still has attachments
    const remaining = await db.query.attachments.findFirst({
        where: eq(attachments.lessonId, attachment.lessonId),
    });

    if (!remaining) {
        await db.update(lessons).set({ hasAttachment: false }).where(eq(lessons.id, attachment.lessonId));
    }

    revalidatePath(`/admin/lessons/${attachment.lessonId}`);
}

// --- Assessment Management ---

export async function createAssessment(lessonId: string, formData: FormData) {
    await enforceAdminRole();

    const questionText = formData.get('questionText') as string;
    const correctAnswer = formData.get('correctAnswer') as string;

    if (!questionText || !correctAnswer) {
        throw new Error('Question and Answer are required');
    }

    await db.insert(assessments).values({
        lessonId,
        questionText,
        correctAnswer,
    });

    await db.update(lessons).set({ hasAssessment: true }).where(eq(lessons.id, lessonId));

    revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteAssessment(id: string) {
    await enforceAdminRole();

    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, id),
    });

    if (!assessment) return;

    await db.delete(userAttempts).where(eq(userAttempts.assessmentId, id));
    await db.delete(assessments).where(eq(assessments.id, id));

    // Check if lesson still has assessments
    const remaining = await db.query.assessments.findFirst({
        where: eq(assessments.lessonId, assessment.lessonId),
    });

    if (!remaining) {
        await db.update(lessons).set({ hasAssessment: false }).where(eq(lessons.id, assessment.lessonId));
    }

    revalidatePath(`/admin/lessons/${assessment.lessonId}`);
}
