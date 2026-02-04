import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase, CreateTransactionDto } from './create-transaction.use-case';
import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/spi/transaction-repository.port';
import { PaymentGatewayPort, PaymentResponse } from '../../domain/ports/spi/payment-gateway.port';
import { Product } from '../../domain/entities/product';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction';

describe('CreateTransactionUseCase', () => {
    let useCase: CreateTransactionUseCase;
    let productRepo: jest.Mocked<ProductRepositoryPort>;
    let transactionRepo: jest.Mocked<TransactionRepositoryPort>;
    let paymentGateway: jest.Mocked<PaymentGatewayPort>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTransactionUseCase,
                {
                    provide: ProductRepositoryPort,
                    useValue: {
                        findById: jest.fn(),
                        updateStock: jest.fn(),
                    },
                },
                {
                    provide: TransactionRepositoryPort,
                    useValue: {
                        save: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: PaymentGatewayPort,
                    useValue: {
                        processPayment: jest.fn((a, c, t, i, at, ce) => Promise.resolve({ id: 'mock', status: 'APPROVED', reference: 'ref' } as any)),
                    },
                },
            ],
        }).compile();

        useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
        productRepo = module.get(ProductRepositoryPort);
        transactionRepo = module.get(TransactionRepositoryPort);
        paymentGateway = module.get(PaymentGatewayPort);
    });

    const mockProduct = new Product('prod-1', 'Test Product', 'Desc', 100, 10, 'img.jpg');
    const mockDto: CreateTransactionDto = {
        productId: 'prod-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        customerAddress: '123 St',
        customerCity: 'City',
        amount: 100,
        currency: 'USD',
        cardToken: 'tok_test',
        installments: 1,
        acceptanceToken: 'test-token',
    };

    it('should create a transaction successfully when payment is approved', async () => {
        productRepo.findById.mockResolvedValue(mockProduct);
        transactionRepo.save.mockImplementation(async (t) => t);
        paymentGateway.processPayment.mockResolvedValue({
            id: 'pay-123',
            status: 'APPROVED',
            amount: 100,
            currency: 'USD',
            reference: 'ref-123',
        } as PaymentResponse);

        const result = await useCase.execute(mockDto);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().status).toBe(TransactionStatus.APPROVED);
        expect(result.getValue().externalTransactionId).toBe('pay-123');
        expect(productRepo.updateStock).toHaveBeenCalledWith('prod-1', 9);
    });

    it('should return failure if product is not found', async () => {
        productRepo.findById.mockResolvedValue(null);

        const result = await useCase.execute(mockDto);

        expect(result.isFailure).toBe(true);
        expect(result.error?.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return failure if product is out of stock', async () => {
        const noStockProduct = new Product('prod-1', 'Test', 'Desc', 100, 0, 'img.jpg');
        productRepo.findById.mockResolvedValue(noStockProduct);

        const result = await useCase.execute(mockDto);

        expect(result.isFailure).toBe(true);
        expect(result.error?.code).toBe('PRODUCT_OUT_OF_STOCK');
    });

    it('should mark transaction as DECLINED if payment fails', async () => {
        productRepo.findById.mockResolvedValue(mockProduct);
        transactionRepo.save.mockImplementation(async (t) => t);
        paymentGateway.processPayment.mockResolvedValue({
            id: 'pay-failed',
            status: 'DECLINED',
            amount: 100,
            currency: 'USD',
            reference: 'ref-failed',
        } as PaymentResponse);

        const result = await useCase.execute(mockDto);

        expect(result.isSuccess).toBe(true); // Logic says it returns the transaction object even if declined
        expect(result.getValue().status).toBe(TransactionStatus.DECLINED);
        expect(productRepo.updateStock).not.toHaveBeenCalled();
    });
});
