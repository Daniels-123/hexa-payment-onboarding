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

import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';

@Injectable()
export class UpdateTransactionStatusUseCase {
    constructor(
        @Inject(TransactionRepositoryPort)
        private readonly transactionRepo: TransactionRepositoryPort,
        @Inject(ProductRepositoryPort)
        private readonly productRepo: ProductRepositoryPort,
    ) { }

    async execute(id: string, dto: UpdateTransactionStatusDto): Promise<Result<void, ApplicationError>> {
        const transaction = await this.transactionRepo.findById(id);

        if (!transaction) {
            return Result.fail({ message: 'Transaction not found', code: 'TRANSACTION_NOT_FOUND' });
        }

        // Check if transitioning to APPROVED from a non-approved state
        if (dto.status === TransactionStatus.APPROVED && transaction.status !== TransactionStatus.APPROVED) {
            // Deduct Stock
            await this.productRepo.updateStock(transaction.product.id, transaction.product.stock - 1);
        }

        // Update logic
        transaction.status = dto.status;
        transaction.externalTransactionId = dto.externalId;

        await this.transactionRepo.update(transaction);

        return Result.ok(undefined);
    }
}
