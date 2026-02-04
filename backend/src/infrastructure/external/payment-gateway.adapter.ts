import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayPort, PaymentResponse } from '../../domain/ports/spi/payment-gateway.port';

@Injectable()
export class PaymentGatewayAdapter implements PaymentGatewayPort {
    private readonly logger = new Logger(PaymentGatewayAdapter.name);
    private readonly baseUrl: string;
    private readonly privateKey: string;
    private readonly integrityKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_URL');
        this.privateKey = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_PRIVATE_KEY');
        this.integrityKey = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_INTEGRITY_KEY');
    }

    async processPayment(
        amount: number,
        currency: string,
        token: string,
        installments: number,
        acceptanceToken: string,
    ): Promise<PaymentResponse> {
        try {
            // Basic payload
            const reference = `TX-${Date.now()}`;

            // Signature Generation
            const rawAmount = amount * 100; // Centavos
            const amountStr = String(rawAmount); // No decimals if integer
            const integrityString = `${reference}${amountStr}${currency}${this.integrityKey}`;

            // Create SHA-256 hash using Node's crypto
            const crypto = require('crypto');
            const signature = crypto.createHash('sha256').update(integrityString).digest('hex');

            const payload = {
                amount_in_cents: rawAmount,
                currency: currency,
                customer_email: 'test@test.com', // Should be passed
                payment_method: {
                    type: 'CARD',
                    token: token,
                    installments: installments,
                },
                reference: reference,
                acceptance_token: acceptanceToken,
                signature: signature
            };

            const { data } = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/transactions`, payload, {
                    headers: {
                        Authorization: `Bearer ${this.privateKey}`,
                    },
                }),
            );

            this.logger.log(`Transaction response from Wompi: ${JSON.stringify(data.data)}`);

            return {
                id: data.data.id,
                status: data.data.status, // e.g. 'PENDING'
                reference: data.data.reference,
            };
        } catch (error: any) {
            this.logger.error('Payment Gateway Error', error.response?.data || error.message);
            return {
                id: '',
                status: 'ERROR',
                reference: '',
            };
        }
    }
}
