'use server';

import { client } from '@/lib/paypal';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { enforceAuthentication } from '@/lib/auth-guards';
import * as paypal from '@paypal/checkout-server-sdk'; // Changed from checkoutNodeJssdk to paypal alias
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fulfillOrder } from '@/lib/fulfillment';

export async function createPayPalOrder(courseId: string) {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch course details
    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        throw new Error('Course not found');
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            reference_id: courseId,
            amount: {
                currency_code: 'USD',
                value: (course.priceCents / 100).toFixed(2),
            },
            description: course.title,
            custom_id: JSON.stringify({
                userId: userId || '', // Empty string if guest
                courseId: courseId,
                offerType: 'core'
            })
        }],
        application_context: {
            brand_name: process.env.NEXT_PUBLIC_APP_NAME || 'Single Class',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upsell`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}`
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

export async function capturePayPalOrder(orderId: string, courseId: string) {
    const session = await enforceAuthentication();
    const currentUserId = session.user.id; // Renamed to avoid shadowing

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const captureResult = await client().execute(request);
        const capture = captureResult.result;
        const captureId = capture.purchase_units[0].payments.captures[0].id;

        // Extract custom_id to get metadata
        const customId = JSON.parse(capture.purchase_units[0].payments.captures[0].custom_id || '{}');
        const { userId, offerType } = customId; // Use userId from custom_id if available

        // Extract Payer Email
        const payerEmail = capture.payer.email_address;

        if (!payerEmail) {
            throw new Error('PayPal Payer Email missing');
        }

        await fulfillOrder(
            userId || currentUserId, // Use userId from custom_id or current session userId
            offerType || 'core',
            captureId,
            'paypal',
            null,
            courseId,
            payerEmail
        );

        return { success: true, orderId: orderId };
    } catch (err: any) {
        console.error('PayPal Capture Order Error:', err);
        throw new Error('Failed to capture PayPal order');
    }
}
