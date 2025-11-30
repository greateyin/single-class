'use server';

import { db } from '@/db';
import { users, transactions, lessons } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { count, eq, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAdminStats() {
    await enforceAdminRole();

    const [userCount] = await db.select({ count: count() }).from(users);
    const [txCount] = await db.select({ count: count() }).from(transactions);

    // Calculate revenue (simple sum for now)
    const allTx = await db.query.transactions.findMany({
        where: eq(transactions.status, 'completed'),
    });
    const totalRevenueCents = allTx.reduce((acc, tx) => acc + tx.amountCents, 0);

    return {
        totalUsers: userCount.count,
        totalRevenue: totalRevenueCents / 100,
        totalSales: txCount.count,
    };
}

export async function getUsers() {
    await enforceAdminRole();
    return db.query.users.findMany({
        orderBy: [desc(users.id)], // Ideally created_at, but using ID for now
        limit: 50,
    });
}

export async function updateUserRole(userId: string, role: 'student' | 'admin') {
    await enforceAdminRole();
    await db.update(users).set({ role }).where(eq(users.id, userId));
    revalidatePath('/admin/users');
}

export async function getLessonsForAdmin() {
    await enforceAdminRole();
    return db.query.lessons.findMany({
        orderBy: [asc(lessons.orderIndex)],
    });
}

export async function updateLesson(lessonId: number, data: { title: string; videoEmbedUrl: string; description: string }) {
    await enforceAdminRole();
    await db.update(lessons).set(data).where(eq(lessons.id, lessonId));
    revalidatePath('/admin/content');
    revalidatePath('/(course)'); // Update student view too
}
