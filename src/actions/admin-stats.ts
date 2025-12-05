'use server';

import { db } from '@/db';
import { transactions } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { sql, and, gte, lte } from 'drizzle-orm';

export type Interval = 'week' | 'month' | 'quarter' | 'year';

export async function getSalesStats(interval: Interval = 'month', startDate?: Date, endDate?: Date) {
    await enforceAdminRole();

    // Default to last 12 months if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setFullYear(end.getFullYear() - 1));

    let timeBucket: any;
    // Postgres date_trunc function
    switch (interval) {
        case 'week':
            timeBucket = sql`date_trunc('week', ${transactions.saleDate})`;
            break;
        case 'month':
            timeBucket = sql`date_trunc('month', ${transactions.saleDate})`;
            break;
        case 'quarter':
            timeBucket = sql`date_trunc('quarter', ${transactions.saleDate})`;
            break;
        case 'year':
            timeBucket = sql`date_trunc('year', ${transactions.saleDate})`;
            break;
    }

    const salesData = await db
        .select({
            date: timeBucket,
            totalSales: sql<number>`sum(${transactions.amountCents})`,
            count: sql<number>`count(*)`,
        })
        .from(transactions)
        .where(
            and(
                gte(transactions.saleDate, start),
                lte(transactions.saleDate, end),
                // Filter for completed sales only? Or include refunds? 
                // Usually Net Sales excludes refunds, Gross includes. Let's do Gross for now or all 'completed'
                sql`${transactions.status} = 'completed'`
            )
        )
        .groupBy(timeBucket)
        .orderBy(timeBucket);

    // Summary metrics
    const totalRevenueResult = await db
        .select({ sum: sql<number>`sum(${transactions.amountCents})` })
        .from(transactions)
        .where(sql`${transactions.status} = 'completed'`);

    const totalOrdersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(sql`${transactions.status} = 'completed'`);

    const refundCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(sql`${transactions.status} = 'refunded'`);

    return {
        chartData: salesData.map(d => ({
            date: d.date,
            amount: Number(d.totalSales) / 100, // Convert cents to dollars
            count: Number(d.count)
        })),
        summary: {
            totalRevenue: (Number(totalRevenueResult[0]?.sum || 0) / 100),
            totalOrders: Number(totalOrdersResult[0]?.count || 0),
            totalRefunds: Number(refundCountResult[0]?.count || 0),
        }
    };
}
