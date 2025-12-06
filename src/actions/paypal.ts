'use server';

import { ordersController } from '@/lib/paypal';
import {
    CheckoutPaymentIntent,
    OrderApplicationContextShippingPreference,
    OrderApplicationContextUserAction
} from '@paypal/paypal-server-sdk';
import { enforceAuthentication } from '@/lib/auth-guards';
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

    const orderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
            referenceId: courseId,
            amount: {
                currencyCode: 'USD',
                value: (course.priceCents / 100).toFixed(2),
            },
            description: course.title,
            customId: JSON.stringify({
                userId: userId || '', // Empty string if guest
                courseId: courseId,
                offerType: 'core'
            })
        }],
        applicationContext: {
            brandName: process.env.NEXT_PUBLIC_APP_NAME || 'Single Class',
            shippingPreference: OrderApplicationContextShippingPreference.NoShipping,
            userAction: OrderApplicationContextUserAction.PayNow,
            returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation`,
            cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}`
        }
    };

    try {
        const { result: order } = await ordersController.createOrder({
            body: orderRequest,
            prefer: "return=representation"
        });
        return { id: order.id };
    } catch (err: unknown) {
        console.error('PayPal Create Order Error:', err);
        throw new Error('Failed to create PayPal order');
    }
}

export async function capturePayPalOrder(orderId: string, courseId: string) {
    // Remove strict auth guard to allow Guest Checkout
    const session = await auth();
    const currentUserId = session?.user?.id;

    console.log(`[PayPal] Starting capture for Order ID: ${orderId}, Course ID: ${courseId}`);
    console.log(`[PayPal] Current Session User: ${currentUserId || 'Guest'}`);

    try {
        const { result: capture } = await ordersController.captureOrder({
            id: orderId,
            body: {}
        });

        console.log('[PayPal] Capture response received');

        if (!capture.purchaseUnits || !capture.purchaseUnits[0] || !capture.purchaseUnits[0].payments || !capture.purchaseUnits[0].payments.captures || !capture.purchaseUnits[0].payments.captures[0]) {
            console.error('[PayPal] Invalid capture response structure:', JSON.stringify(capture, null, 2));
            throw new Error('Invalid PayPal capture response structure');
        }

        const captureData = capture.purchaseUnits[0].payments.captures[0];
        const captureId = captureData.id;

        if (!captureId) {
            throw new Error('PayPal capture ID missing');
        }

        // Extract customId to get metadata
        const customId = JSON.parse(captureData.customId || '{}');
        const { userId, offerType } = customId; // Use userId from customId if available

        console.log('[PayPal] Extracted Custom ID:', customId);

        // Extract Payer Email
        // Note: SDK types might be tricky, checking structure from user log
        const payerEmail = (capture as any).payer?.email_address || (capture as any).payer?.emailAddress;

        if (!payerEmail) {
            console.error('[PayPal] Payer Email missing. Full Capture Object:', JSON.stringify(capture, null, 2));
            throw new Error('PayPal Payer Email missing');
        } else {
            console.log(`[PayPal] Payer Email: ${payerEmail}`);
        }

        // Extract Amount and Currency
        const amount = captureData.amount?.value;
        const currency = captureData.amount?.currencyCode || 'USD';

        console.log(`[PayPal] Amount: ${amount} ${currency}`);

        await fulfillOrder(
            userId || currentUserId, // Use userId from custom_id which was set at create time, or current session
            offerType || 'core',
            captureId,
            'paypal',
            null,
            courseId,
            payerEmail,
            null, // receiptUrl
            currency,
            { amount, payerEmail, orderId } // paymentDetails
        );

        return { success: true, orderId: orderId };
    } catch (err: unknown) {
        console.error('PayPal Capture Order Error:', err);
        throw new Error('Failed to capture PayPal order');
    }
}
