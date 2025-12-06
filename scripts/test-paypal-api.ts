import { ordersController } from '@/lib/paypal';
import { CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';

async function main() {
    console.log('Testing PayPal API connectivity...');

    const orderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
            amount: {
                currencyCode: 'USD',
                value: '10.00',
            },
            description: 'Test Order',
        }]
    };

    try {
        const { result: order } = await ordersController.createOrder({
            body: orderRequest,
            prefer: "return=representation"
        });
        console.log('Successfully created PayPal Order!');
        console.log('Order ID:', order.id);
        console.log('Status:', order.status);
    } catch (err: unknown) {
        console.error('PayPal API Error:', err);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
