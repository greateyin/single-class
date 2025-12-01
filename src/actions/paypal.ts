'use server';

import { client } from '@/lib/paypal';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fulfillOrder } from '@/lib/fulfillment';

export async function createPayPalOrder(courseId: number) {
    const session = await enforceAuthentication();

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        throw new Error('Course not found');
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: (course.priceCents / 100).toFixed(2),
            },
            description: course.title,
            custom_id: JSON.stringify({
                userId: session.user.id,
                courseId: courseId,
                offerType: 'core'
            })
        }],
        application_context: {
            brand_name: process.env.NEXT_PUBLIC_APP_NAME || 'Single Class',
            user_action: 'PAY_NOW',
        }
    });

    try {
        const order = await client().execute(request);
        return { id: order.result.id };
    } catch (err: any) {
        console.error('PayPal Create Order Error:', err);
        throw new Error('Failed to create PayPal order');
    }
}

export async function capturePayPalOrder(orderId: string, courseId: number) {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client().execute(request);
        const captureId = capture.result.purchase_units[0].payments.captures[0].id;

        // Fulfill Order
        await fulfillOrder(
            userId,
            'core',
            captureId, // Use Capture ID as transaction ref
            'paypal',
            null, // No customer ref for PayPal guest checkout
            courseId
        );

        return { success: true };
    } catch (err: any) {
        console.error('PayPal Capture Order Error:', err);
        throw new Error('Failed to capture PayPal order');
    }
}
