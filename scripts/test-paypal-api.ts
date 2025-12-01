import { client } from '@/lib/paypal';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

async function main() {
    console.log('Testing PayPal API connectivity...');

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: '10.00',
            },
            description: 'Test Order',
        }]
    });

    try {
        const order = await client().execute(request);
        console.log('Successfully created PayPal Order!');
        console.log('Order ID:', order.result.id);
        console.log('Status:', order.result.status);
    } catch (err: any) {
        console.error('PayPal API Error:', err);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
