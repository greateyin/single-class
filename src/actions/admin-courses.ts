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

export async function updateCourse(courseId: number, formData: FormData) {
    await enforceAdminRole();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceCents = parseInt(formData.get('priceCents') as string || '0');
    const isPublished = formData.get('isPublished') === 'on';

    if (!title) {
        throw new Error('Title is required');
    }

    await db.update(courses)
        .set({
            title,
            description,
            priceCents,
            isPublished,
        })
        .where(eq(courses.id, courseId));

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    redirect('/admin/courses');
}

export async function deleteCourse(courseId: number) {
    await enforceAdminRole();

    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}
