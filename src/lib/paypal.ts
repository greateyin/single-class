import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const configureEnvironment = function () {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing PayPal credentials');
    }

    const environment = process.env.PAYPAL_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');

    return environment === 'live'
        ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
        : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = function () {
    return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment());
};

export { client };
