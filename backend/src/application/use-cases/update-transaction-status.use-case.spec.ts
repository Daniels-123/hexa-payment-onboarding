import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionStatusUseCase, UpdateTransactionStatusDto } from './update-transaction-status.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/spi/transaction-repository.port';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction';
import { Product } from '../../domain/entities/product';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery';
import { Customer } from '../../domain/entities/customer';

describe('UpdateTransactionStatusUseCase', () => {
    let useCase: UpdateTransactionStatusUseCase;
    let transactionRepo: jest.Mocked<TransactionRepositoryPort>;

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
            ],
        }).compile();

        useCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
        transactionRepo = module.get(TransactionRepositoryPort);
    });

    const mockTransaction = new Transaction(
        'tx-1',
        100,
        'USD',
        TransactionStatus.PENDING,
        'ref-1',
        {} as Product,
        {} as Delivery,
        new Date()
    );

    const mockDto: UpdateTransactionStatusDto = {
        status: TransactionStatus.APPROVED,
        externalId: 'ext-123',
    };

    it('should update transaction status successfully', async () => {
        transactionRepo.findById.mockResolvedValue(mockTransaction);

        const result = await useCase.execute('tx-1', mockDto);

        expect(result.isSuccess).toBe(true);
        expect(mockTransaction.status).toBe(TransactionStatus.APPROVED);
        expect(mockTransaction.externalTransactionId).toBe('ext-123');
        expect(transactionRepo.update).toHaveBeenCalledWith(mockTransaction);
    });

    it('should return failure if transaction is not found', async () => {
        transactionRepo.findById.mockResolvedValue(null);

        const result = await useCase.execute('tx-1', mockDto);

        expect(result.isFailure).toBe(true);
        expect(result.error?.code).toBe('TRANSACTION_NOT_FOUND');
    });
});
