'use server';

import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function verifyEmail(token: string) {
    const existingToken = await db.query.verificationTokens.findFirst({
        where: eq(verificationTokens.token, token),
    });

    if (!existingToken) {
        return { success: false, message: 'Token does not exist!' };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { success: false, message: 'Token has expired!' };
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, existingToken.identifier),
    });

    if (!existingUser) {
        return { success: false, message: 'Email does not exist!' };
    }

    await db.update(users)
        .set({
            emailVerified: new Date(),
            email: existingToken.identifier, // Optional: if handling email changes
        })
        .where(eq(users.id, existingUser.id));

    await db.delete(verificationTokens)
        .where(eq(verificationTokens.identifier, existingToken.identifier)); // Delete all tokens for this email

    return { success: true, message: 'Email verified!' };
}

export async function resendVerificationEmail(email: string) {
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!existingUser) {
        return { success: false, message: 'Email does not exist!' };
    }

    if (existingUser.emailVerified) {
        return { success: false, message: 'Email already verified!' };
    }

    // Reuse existing token if valid? For security, we usually revoke old ones or just add a new one.
    // Auth.js logic typically deletes old tokens. Let's delete old tokens first.
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

    const token = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
        identifier: email,
        token,
        expires,
    });

    const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    // Dynamic import to avoid edge runtime issues if any (though standard import is fine here)
    const { resend } = await import('@/lib/email');

    const { getEmailTemplate } = await import('@/lib/email-templates');

    const { error } = await resend.emails.send({
        from: `${process.env.NEXT_PUBLIC_APP_NAME || 'Single Class'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@resend.dev'}>`,
        to: email,
        subject: "Confirm your email",
        html: getEmailTemplate(
            "Verify your email",
            "Please verify your email address to continue.",
            "Verify Email",
            confirmLink
        ),
    });

    if (error) {
        return { success: false, message: 'Failed to send verification email: ' + error.message };
    }

    return { success: true, message: 'Verification email sent!' };
}
