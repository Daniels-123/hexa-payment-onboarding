import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayAdapter } from './payment-gateway.adapter';
import { of, throwError } from 'rxjs';

describe('PaymentGatewayAdapter', () => {
    let adapter: PaymentGatewayAdapter;
    let httpService: HttpService;
    let configService: ConfigService;

    const mockHttpService = {
        post: jest.fn(),
    };

    const mockConfigService = {
        getOrThrow: jest.fn((key) => {
            if (key === 'PAYMENT_GATEWAY_URL') return 'http://mock-api';
            if (key === 'PAYMENT_GATEWAY_PRIVATE_KEY') return 'mock-key';
            if (key === 'PAYMENT_GATEWAY_INTEGRITY_KEY') return 'mock-integrity';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentGatewayAdapter,
                { provide: HttpService, useValue: mockHttpService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        adapter = module.get<PaymentGatewayAdapter>(PaymentGatewayAdapter);
        httpService = module.get<HttpService>(HttpService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    it('should process payment successfully', async () => {
        const mockResponse = {
            data: {
                data: {
                    id: '12345',
                    status: 'PENDING',
                    reference: 'TX-12345',
                },
            },
        };
        mockHttpService.post.mockReturnValue(of(mockResponse));

        const result = await adapter.processPayment(100, 'COP', 'tok_test', 1, 'accept_tok', 'test@example.com');

        expect(result.id).toBe('12345');
        expect(result.status).toBe('PENDING');
        expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
        mockHttpService.post.mockReturnValue(throwError(() => new Error('API Error')));

        const result = await adapter.processPayment(100, 'COP', 'tok_test', 1, 'accept_tok', 'test@example.com');

        expect(result.status).toBe('ERROR');
        expect(result.id).toBe('');
    });
});
