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
