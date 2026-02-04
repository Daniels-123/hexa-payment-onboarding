import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionStatusUseCase, UpdateTransactionStatusDto } from './update-transaction-status.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/spi/transaction-repository.port';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction';
import { Product } from '../../domain/entities/product';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery';
import { Customer } from '../../domain/entities/customer';
import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';

describe('UpdateTransactionStatusUseCase', () => {
    let useCase: UpdateTransactionStatusUseCase;
    let transactionRepo: jest.Mocked<TransactionRepositoryPort>;
    let productRepo: jest.Mocked<ProductRepositoryPort>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateTransactionStatusUseCase,
                {
                    provide: TransactionRepositoryPort,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: ProductRepositoryPort,
                    useValue: {
                        updateStock: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
        transactionRepo = module.get(TransactionRepositoryPort);
        productRepo = module.get(ProductRepositoryPort);
    });

    const mockTransaction = new Transaction(
        'tx-1',
        100,
        'USD',
        TransactionStatus.PENDING,
        'ref-1',
        { id: 'prod-1', stock: 10 } as Product,
        {} as Delivery,
        new Date()
    );

    const mockDto: UpdateTransactionStatusDto = {
        status: TransactionStatus.APPROVED,
        externalId: 'ext-123',
    };

    it('should update transaction status and deduct stock when approved', async () => {
        transactionRepo.findById.mockResolvedValue(mockTransaction);

        const result = await useCase.execute('tx-1', mockDto);

        expect(result.isSuccess).toBe(true);
        expect(mockTransaction.status).toBe(TransactionStatus.APPROVED);
        expect(mockTransaction.externalTransactionId).toBe('ext-123');
        expect(transactionRepo.update).toHaveBeenCalledWith(mockTransaction);
        expect(productRepo.updateStock).toHaveBeenCalledWith('prod-1', 9);
    });

    it('should NOT deduct stock if status is not APPROVED', async () => {
        transactionRepo.findById.mockResolvedValue(mockTransaction);
        const declinedDto = { ...mockDto, status: TransactionStatus.DECLINED };

        const result = await useCase.execute('tx-1', declinedDto);

        expect(result.isSuccess).toBe(true);
        expect(mockTransaction.status).toBe(TransactionStatus.DECLINED);
        expect(productRepo.updateStock).not.toHaveBeenCalled();
    });

    it('should return failure if transaction is not found', async () => {
        transactionRepo.findById.mockResolvedValue(null);

        const result = await useCase.execute('tx-1', mockDto);

        expect(result.isFailure).toBe(true);
        expect(result.error?.code).toBe('TRANSACTION_NOT_FOUND');
    });
});
