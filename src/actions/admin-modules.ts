'use server';

import { db } from '@/db';
import { modules, lessons } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createModule(courseId: string, title: string) {
    await enforceAdminRole();

    // Get max order index
    const existingModules = await db.query.modules.findMany({
        where: eq(modules.courseId, courseId),
        orderBy: [asc(modules.orderIndex)],
    });
    const maxOrder = existingModules.length > 0 ? existingModules[existingModules.length - 1].orderIndex : -1;

    await db.insert(modules).values({
        courseId,
        title,
        orderIndex: maxOrder + 1,
    });

    revalidatePath(`/admin/courses/${courseId}/curriculum`);
}

export async function updateModule(moduleId: string, title: string) {
    await enforceAdminRole();

    await db.update(modules)
        .set({ title })
        .where(eq(modules.id, moduleId));

    // We need to find the courseId to revalidate
    const module = await db.query.modules.findFirst({
        where: eq(modules.id, moduleId),
    });

    if (module) {
        revalidatePath(`/admin/courses/${module.courseId}/curriculum`);
    }
}

export async function deleteModule(moduleId: string) {
    await enforceAdminRole();

    const module = await db.query.modules.findFirst({
        where: eq(modules.id, moduleId),
    });

    if (!module) return;

    // Optional: Move lessons to another module or delete them?
    // For now, let's assume we delete them or they become orphaned (which is bad).
    // Better: Delete lessons in this module.
    await db.delete(lessons).where(eq(lessons.moduleId, moduleId));
    await db.delete(modules).where(eq(modules.id, moduleId));

    revalidatePath(`/admin/courses/${module.courseId}/curriculum`);
}

export async function reorderModules(items: { id: string; orderIndex: number }[]) {
    await enforceAdminRole();

    await db.transaction(async (tx) => {
        for (const item of items) {
            await tx.update(modules)
                .set({ orderIndex: item.orderIndex })
                .where(eq(modules.id, item.id));
        }
    });

    // Revalidate for the first item's course (assuming all are in same course)
    if (items.length > 0) {
        const module = await db.query.modules.findFirst({
            where: eq(modules.id, items[0].id),
        });
        if (module) {
            revalidatePath(`/admin/courses/${module.courseId}/curriculum`);
        }
    }
}
