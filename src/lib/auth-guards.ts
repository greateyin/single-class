import { auth } from './auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Checks if the user is authenticated, otherwise redirects to sign-in.
 */
export async function enforceAuthentication() {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/api/auth/signin'); // Standard Auth.js sign-in path
    }
    return session;
}

/**
 * Checks if the user has the 'admin' role. Must be used in all /admin routes.
 */
export async function enforceAdminRole() {
    const session = await enforceAuthentication();
    if (session.user.role !== 'admin') {
        redirect('/403'); // Insufficient permissions
    }
    return session;
}

/**
 * Checks if the user has paid (Core Offer status is completed).
 */
export async function enforcePaidAccess() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    // Query Drizzle DB
    const paid = await db.query.transactions.findFirst({
        where: and(
            eq(transactions.userId, userId),
            eq(transactions.type, 'core'),
            eq(transactions.status, 'completed')
        ),
    });

    if (!paid) {
        redirect('/enroll'); // Redirect to core enrollment page
    }
    return session;
}
