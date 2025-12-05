'use server';

import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function registerUser(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedFields = registerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Invalid input',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return {
            success: false,
            message: 'User already exists',
        };
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    try {
        await db.insert(users).values({
            id: crypto.randomUUID(),
            name,
            email,
            hashedPassword,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role: 'student',
        });

        // Verification Token
        const token = crypto.randomUUID();
        const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

        await db.insert(verificationTokens).values({
            identifier: email,
            token,
            expires,
        });

        const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

        // Use standard import if possible, or dynamic import if Resend is not imported
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { getEmailTemplate } = await import('@/lib/email-templates');

        const { error } = await resend.emails.send({
            from: `${process.env.NEXT_PUBLIC_APP_NAME || 'Single Class'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@resend.dev'}>`,
            to: email,
            subject: "Confirm your email",
            html: getEmailTemplate(
                "Verify your email",
                "Thanks for signing up! Please verify your email address to continue.",
                "Verify Email",
                confirmLink
            ),
        });

        if (error) {
            console.error('Resend error:', error);
            // Note: User is created but email failed. Maybe we should rollback or return specific warning?
            // Since transaction support might be tricky with Resend call, we'll return success: false for now.
            return { success: false, message: 'Account created but failed to send verification email: ' + error.message };
        }

        return {
            success: true,
            message: 'Confirmation email sent!',
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Something went wrong',
        };
    }
}
