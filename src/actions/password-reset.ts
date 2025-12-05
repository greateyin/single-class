'use server';

import { db } from '@/db';
import { passwordResetTokens, users } from '@/db/schema';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;
    const validatedFields = forgotPasswordSchema.safeParse({ email });

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid email address' };
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!existingUser) {
        // Return success to avoid user enumeration? 
        // For now, let's just return generic success.
        return { success: true, message: 'If an account exists, a reset link has been sent.' };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    try {
        await db.insert(passwordResetTokens).values({
            email,
            token,
            expiresAt,
        });

        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

        const { error } = await resend.emails.send({
            from: `${process.env.NEXT_PUBLIC_APP_NAME || 'Single Class'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@resend.dev'}>`,
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p><p>Link expires in 1 hour.</p>`,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, message: 'Failed to send reset email: ' + error.message };
        }

        return { success: true, message: 'If an account exists, a reset link has been sent.' };
    } catch (error) {
        console.error('Password reset request failed:', error);
        return { success: false, message: 'Failed to send reset email' };
    }
}

export async function resetPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    const validatedFields = resetPasswordSchema.safeParse({ token, password });

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid input' };
    }

    const resetToken = await db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken) {
        return { success: false, message: 'Invalid or expired token' };
    }

    if (new Date() > resetToken.expiresAt) {
        return { success: false, message: 'Token has expired' };
    }

    const hashedPassword = await hash(password, 10);

    try {
        await db.update(users)
            .set({ hashedPassword })
            .where(eq(users.email, resetToken.email));

        // Delete used token
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

        return { success: true, message: 'Password reset successfully' };
    } catch (error) {
        console.error('Password reset failed:', error);
        return { success: false, message: 'Failed to reset password' };
    }
}
