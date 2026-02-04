export interface PaymentResponse {
    id: string; // External Transaction ID
    status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
    reference: string;
}

export interface PaymentGatewayPort {
    processPayment(
        amount: number,
        currency: string,
        token: string, // Card token or specialized representation
        installments: number,
        acceptanceToken: string,
        customerEmail: string,
    ): Promise<PaymentResponse>;
}

export const PaymentGatewayPort = Symbol('PaymentGatewayPort');
