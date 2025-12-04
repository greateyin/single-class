declare module '@paypal/checkout-server-sdk' {
    namespace core {
        class LiveEnvironment {
            constructor(clientId: string, clientSecret: string);
        }
        class SandboxEnvironment {
            constructor(clientId: string, clientSecret: string);
        }
        class PayPalHttpClient {
            constructor(environment: unknown);
            execute(request: unknown): Promise<any>;
        }
    }
    namespace orders {
        class OrdersCreateRequest {
            prefer(prefer: string): void;
            requestBody(body: unknown): void;
        }
        class OrdersCaptureRequest {
            constructor(orderId: string);
            requestBody(body: unknown): void;
        }
    }
}
