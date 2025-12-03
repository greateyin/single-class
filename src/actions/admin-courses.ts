'use server';

import { db } from '@/db';
import { courses } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
    redirect(`/admin/courses/${newCourse.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
    await enforceAdminRole();

    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const description = formData.get('description') as string;
    const language = formData.get('language') as string;
    const level = formData.get('level') as string;
    const category = formData.get('category') as string;
    const primaryTopic = formData.get('primaryTopic') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Pricing & Publish (handled separately or together, keeping them here for now)
    const priceCents = parseInt(formData.get('priceCents') as string || '0');
    const isPublished = formData.get('isPublished') === 'on';

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
            priceCents,
            isPublished,
        })
        .where(eq(courses.id, courseId));

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    redirect('/admin/courses');
}

export async function deleteCourse(courseId: string) {
    await enforceAdminRole();

    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}
