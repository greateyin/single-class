'use server';

import { db } from '@/db';
import { courses } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

export async function createCourse(formData: FormData) {
    await enforceAdminRole();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceCents = parseInt(formData.get('priceCents') as string || '0');
    const isPublished = formData.get('isPublished') === 'on';

    if (!title) {
        throw new Error('Title is required');
    }

    const [newCourse] = await db.insert(courses).values({
        title,
        description,
        priceCents,
        isPublished,
    }).returning();

    revalidatePath('/admin/courses');
    redirect(`/admin/courses/${newCourse.id}?updated=true`);
}

export async function updateCourseLandingPage(courseId: string, formData: FormData) {
    await enforceAdminRole();

    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const description = formData.get('description') as string;
    const language = formData.get('language') as string;
    const level = formData.get('level') as string;
    const category = formData.get('category') as string;
    const primaryTopic = formData.get('primaryTopic') as string;
    // Image URL can be updated here manually too
    const imageUrl = formData.get('imageUrl') as string;

    // Parse features JSON
    let features = [];
    try {
        const featuresJson = formData.get('features') as string;
        if (featuresJson) {
            features = JSON.parse(featuresJson);
        }
    } catch (e) {
        console.error('Failed to parse features JSON', e);
    }

    if (!title) {
        throw new Error('Title is required');
    }

    await db.update(courses)
        .set({
            title,
            subtitle,
            description,
            language,
            level,
            category,
            primaryTopic,
            imageUrl,
            features,
        })
        .where(eq(courses.id, courseId));

    revalidatePath(`/admin/courses/${courseId}/landing-page`);
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/courses');
    redirect(`/admin/courses/${courseId}/landing-page?updated=true`);
}

export async function updateCoursePricing(courseId: string, formData: FormData) {
    await enforceAdminRole();

    const priceCents = parseInt(formData.get('priceCents') as string || '0');

    await db.update(courses)
        .set({ priceCents })
        .where(eq(courses.id, courseId));

    revalidatePath(`/admin/courses/${courseId}/pricing`);
    revalidatePath('/admin/courses');
    redirect(`/admin/courses/${courseId}/pricing?updated=true`);
}

export async function updateCourseSettings(courseId: string, formData: FormData) {
    await enforceAdminRole();

    const isPublished = formData.get('isPublished') === 'on';
    const allowDownload = formData.get('allowDownload') === 'on';
    const accessMonths = parseInt(formData.get('accessMonths') as string) || null;
    const guarantee = formData.get('guarantee') as string;

    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;

    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const endDate = endDateStr ? new Date(endDateStr) : new Date('2100-12-31');

    await db.update(courses)
        .set({
            isPublished,
            allowDownload,
            accessMonths,
            guarantee,
            startDate,
            endDate
        })
        .where(eq(courses.id, courseId));

    revalidatePath(`/admin/courses/${courseId}/settings`);
    revalidatePath('/admin/courses');
    redirect(`/admin/courses/${courseId}/settings?updated=true`);
}

export async function deleteCourse(courseId: string) {
    await enforceAdminRole();

    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}

export async function uploadCourseImage(courseId: string, imageUrl: string | FormData) {
    await enforceAdminRole();

    let url = '';

    if (typeof imageUrl === 'string') {
        url = imageUrl;
    } else {
        // Legacy FormData support
        const formData = imageUrl;
        const file = formData.get('file') as File;
        const urlFromForm = formData.get('imageUrl') as string;

        url = urlFromForm || '';

        if (file && file.size > 0 && file.name !== 'undefined') {
            if (process.env.BLOB_READ_WRITE_TOKEN) {
                try {
                    const blob = await put(file.name, file, {
                        access: 'public',
                    });
                    url = blob.url;
                } catch (error) {
                    console.error('Vercel Blob upload failed:', error);
                    throw new Error('Upload failed');
                }
            } else {
                console.warn('BLOB_READ_WRITE_TOKEN not set. Using mock URL.');
                url = `https://mock-storage.com/${file.name}`;
            }
        }
    }

    await db.update(courses)
        .set({ imageUrl: url })
        .where(eq(courses.id, courseId));

    revalidatePath(`/admin/courses/${courseId}/landing-page`);
    // Only redirect if it was a form submission (FormData), otherwise just revalidate
    if (typeof imageUrl !== 'string') {
        redirect(`/admin/courses/${courseId}/landing-page?updated=true`);
    }
}
