'use server';

import { db } from '@/db';
import { enrollments } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateEnrollmentExpiration(enrollmentId: string, formData: FormData) {
    await enforceAdminRole();

    const expiresAtStr = formData.get('expiresAt') as string;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    await db.update(enrollments)
        .set({ expiresAt })
        .where(eq(enrollments.id, enrollmentId));

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/[id]`); // We'll need to pass the user ID to revalidate specifically if possible, but generic path works too
}

import { hash } from 'bcrypt';
import { users } from '@/db/schema';

export async function resetUserPassword(userId: string, formData: FormData) {
    await enforceAdminRole();

    const newPassword = formData.get('password') as string;

    if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    const hashedPassword = await hash(newPassword, 10);

    await db.update(users)
        .set({ hashedPassword })
        .where(eq(users.id, userId));

    revalidatePath(`/admin/users/${userId}`);
}
