import { Client, Environment, LogLevel, OrdersController } from '@paypal/paypal-server-sdk';

const configureClient = function () {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing PayPal credentials');
    }

    const environment = process.env.PAYPAL_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');

    return new Client({
        clientCredentialsAuthCredentials: {
            oAuthClientId: clientId,
            oAuthClientSecret: clientSecret,
        },
        timeout: 0,
        environment: environment === 'live' ? Environment.Production : Environment.Sandbox,
        logging: {
            logLevel: LogLevel.Info,
        },
    });
};

const client = configureClient();
const ordersController = new OrdersController(client);

export { client, ordersController };
