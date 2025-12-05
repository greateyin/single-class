'use server';

import { db } from '@/db';
import { transactions, users, courses } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { stripe } from '@/lib/stripe';
import { desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getOrders(page = 1, limit = 20) {
    await enforceAdminRole();
    const offset = (page - 1) * limit;

    const data = await db.query.transactions.findMany({
        with: {
            user: true,
            course: true,
        },
        orderBy: [desc(transactions.saleDate)],
        limit,
        offset,
    });

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(transactions);
    const total = Number(countResult[0]?.count || 0);

    return {
        data,
        metadata: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getOrder(id: string) {
    await enforceAdminRole();
    const order = await db.query.transactions.findFirst({
        where: eq(transactions.id, id),
        with: {
            user: true,
            course: true,
        },
    });
    return order;
}

export async function refundOrder(transactionId: string) {
    await enforceAdminRole();
    const order = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'completed') throw new Error('Order is not eligible for refund');
    if (!order.paymentIntentId) throw new Error('No payment intent ID found');

    try {
        await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
        });

        await db.update(transactions)
            .set({ status: 'refunded' })
            .where(eq(transactions.id, transactionId));

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${transactionId}`);
        return { success: true };
    } catch (error) {
        console.error('Refund failed:', error);
        throw new Error('Refund failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}
