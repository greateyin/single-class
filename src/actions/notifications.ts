"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { enforceAuthentication } from "@/lib/auth-guards";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    const data = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.createdAt)],
        limit: 10,
    });

    const unreadCount = data.filter((n) => !n.isRead).length;

    return { notifications: data, unreadCount };
}

export async function markAsRead(id: string) {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    revalidatePath("/admin");
}

export async function markAllAsRead() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));

    revalidatePath("/admin");
}
