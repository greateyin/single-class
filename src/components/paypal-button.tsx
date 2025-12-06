'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createPayPalOrder, capturePayPalOrder } from '@/actions/paypal';

interface PayPalButtonProps {
    courseId: string;
    clientId: string;
}

export function PayPalButton({ courseId, clientId }: PayPalButtonProps) {
    return (
        <PayPalScriptProvider options={{ clientId: clientId.trim() }}>
            <PayPalButtons
                style={{ layout: "horizontal", height: 55 }}
                createOrder={async () => {
                    const order = await createPayPalOrder(courseId);
                    if (!order?.id) {
                        throw new Error('Failed to create PayPal order');
                    }
                    return order.id;
                }}
                onApprove={async (data) => {
                    await capturePayPalOrder(data.orderID, courseId);
                    window.location.href = `/confirmation`;
                }}
            />
        </PayPalScriptProvider>
    );
}
