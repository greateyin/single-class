'use server';

import { db } from '@/db';
import { transactions, users, lessons } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { sql, eq, desc, count } from 'drizzle-orm';
import { fulfillOrder } from '@/lib/fulfillment';
import { v4 as uuidv4 } from 'uuid';

export async function manualFulfillOrder(email: string, courseId: string, offerType: 'core' | 'upsell' | 'downsell' = 'core') {
    await enforceAdminRole();

    const transactionId = `manual_${uuidv4()}`;

    try {
        await fulfillOrder(
            null, // Let it find/create user by email
            offerType,
            transactionId,
            'stripe', // Source
            null, // Customer Ref (unknown)
            courseId,
            email,
            null, // receiptUrl
            'usd', // currency
            { note: 'Manual Fulfillment' } // paymentDetails
        );
        return { success: true };
    } catch (error) {
        console.error('Manual fulfillment failed:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { success: false, error: (error as any).message || 'Failed' };
    }
}

export async function getSalesStats() {
    await enforceAdminRole();

    // 1. Total Revenue
    const revenueResult = await db
        .select({
            total: sql<number>`sum(${transactions.amountCents})`
        })
        .from(transactions)
        .where(eq(transactions.status, 'completed'));

    const totalRevenue = revenueResult[0]?.total || 0;

    // 2. Sales Count by Type
    const salesByType = await db
        .select({
            type: transactions.type,
            count: count(transactions.id),
        })
        .from(transactions)
        .where(eq(transactions.status, 'completed'))
        .groupBy(transactions.type);

    return {
        totalRevenue,
        salesByType,
    };
}

export async function getAdminStats() {
    await enforceAdminRole();

    // 1. Total Revenue & Sales Count
    const revenueResult = await db
        .select({
            totalRevenue: sql<number>`sum(${transactions.amountCents})`,
            totalSales: count(transactions.id),
        })
        .from(transactions)
        .where(eq(transactions.status, 'completed'));

    const { totalRevenue, totalSales } = revenueResult[0] || { totalRevenue: 0, totalSales: 0 };

    // 2. Total Users
    const usersResult = await db.select({ count: count(users.id) }).from(users);
    const totalUsers = usersResult[0]?.count || 0;

    return {
        totalRevenue: (totalRevenue || 0) / 100, // Convert to dollars
        totalUsers,
        totalSales,
    };
}

export async function getUsersList() {
    await enforceAdminRole();

    // Fetch users with their transactions and progress
    // Note: Drizzle's query builder is great for this, but for complex aggregations 
    // sometimes raw SQL or separate queries are cleaner. 
    // Let's use query builder with 'with' relations if possible, or just map it.

    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        with: {
            transactions: true,
            lessonCompletion: true,
        },
    });

    // Get total lesson count for progress calculation
    const totalLessonsResult = await db.select({ count: count(lessons.id) }).from(lessons);
    const totalLessons = totalLessonsResult[0]?.count || 0;

    return allUsers.map(user => {
        const hasCore = user.transactions.some(t => t.type === 'core' && t.status === 'completed');
        const completedLessons = user.lessonCompletion.length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            joinedAt: user.createdAt,
            status: hasCore ? 'Paid' : 'Free',
            progress: progress,
        };
    });
}
