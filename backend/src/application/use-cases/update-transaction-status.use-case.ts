import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepositoryPort } from '../../domain/ports/spi/transaction-repository.port';
import { TransactionStatus } from '../../domain/entities/transaction';
import { Result, ApplicationError } from '../../domain/logic/result';
import { IsString, IsEnum } from 'class-validator';

export class UpdateTransactionStatusDto {
    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    @IsString()
    externalId: string;
}

@Injectable()
export class UpdateTransactionStatusUseCase {
    constructor(
        @Inject(TransactionRepositoryPort)
        private readonly transactionRepo: TransactionRepositoryPort,
    ) { }

    async execute(id: string, dto: UpdateTransactionStatusDto): Promise<Result<void, ApplicationError>> {
        const transaction = await this.transactionRepo.findById(id);

        if (!transaction) {
            return Result.fail({ message: 'Transaction not found', code: 'TRANSACTION_NOT_FOUND' });
        }

        // Update logic
        transaction.status = dto.status;
        transaction.externalTransactionId = dto.externalId;

        // In a real scenario, we might want to check the previous status to avoid invalid transitions
        // e.g., if already APPROVED, we shouldn't allow changing to DECLINED easily.
        // For this MVP/Onboarding, we allow the update.

        await this.transactionRepo.update(transaction);

        return Result.ok(undefined);
    }
}
