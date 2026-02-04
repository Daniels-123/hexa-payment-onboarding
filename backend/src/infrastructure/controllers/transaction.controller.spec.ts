import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/update-transaction-status.use-case';
import { Result } from '../../domain/logic/result';

describe('TransactionController', () => {
    let controller: TransactionController;
    let createUseCase: CreateTransactionUseCase;
    let updateUseCase: UpdateTransactionStatusUseCase;

    const mockCreateUseCase = {
        execute: jest.fn(),
    };

    const mockUpdateUseCase = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionController],
            providers: [
                {
                    provide: CreateTransactionUseCase,
                    useValue: mockCreateUseCase,
                },
                {
                    provide: UpdateTransactionStatusUseCase,
                    useValue: mockUpdateUseCase,
                },
            ],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
        createUseCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
        updateUseCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a transaction successfully', async () => {
            const dto: any = { amount: 100 };
            const expectedResult = Result.ok({ id: '123' });
            mockCreateUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.create(dto);
            expect(result).toEqual({ id: '123' });
        });

        it('should throw BadRequestException on failure', async () => {
            const dto: any = { amount: -1 };
            const expectedResult = Result.fail('Invalid amount');
            mockCreateUseCase.execute.mockResolvedValue(expectedResult);

            await expect(controller.create(dto)).rejects.toThrow();
        });
    });

    describe('updateStatus', () => {
        it('should update status successfully', async () => {
            const dto: any = { status: 'APPROVED' };
            const expectedResult = Result.ok(undefined);
            mockUpdateUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.updateStatus('123', dto);
            expect(result).toEqual({ message: 'Transaction updated successfully' });
        });

        it('should throw BadRequestException on failure', async () => {
            const dto: any = { status: 'INVALID' };
            const expectedResult = Result.fail('Invalid status');
            mockUpdateUseCase.execute.mockResolvedValue(expectedResult);

            await expect(controller.updateStatus('123', dto)).rejects.toThrow();
        });
    });
});
