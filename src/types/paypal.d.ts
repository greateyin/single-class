declare module '@paypal/checkout-server-sdk' {
    namespace core {
        class LiveEnvironment {
            constructor(clientId: string, clientSecret: string);
        }
        class SandboxEnvironment {
            constructor(clientId: string, clientSecret: string);
        }
        class PayPalHttpClient {
            constructor(environment: any);
            execute(request: any): Promise<any>;
        }
    }
    namespace orders {
        class OrdersCreateRequest {
            prefer(prefer: string): void;
            requestBody(body: any): void;
        }
        class OrdersCaptureRequest {
            constructor(orderId: string);
            requestBody(body: any): void;
        }
    }
}
