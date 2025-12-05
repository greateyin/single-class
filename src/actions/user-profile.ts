'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { enforceAuthentication } from '@/lib/auth-guards';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().optional().refine((val) => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters if provided',
    }),
});

export async function updateProfile(formData: FormData) {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    const rawData = {
        name: formData.get('name'),
        password: formData.get('password') || undefined,
    };

    const validatedFields = updateProfileSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Invalid input',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, password } = validatedFields.data;

    try {
        const updateData: { name: string; hashedPassword?: string } = { name };

        if (password) {
            updateData.hashedPassword = await hash(password, 10);
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        revalidatePath('/dashboard');
        revalidatePath('/profile');

        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { success: false, message: 'Failed to update profile' };
    }
}
