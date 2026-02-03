import { Controller, Post, Body, BadRequestException, HttpStatus, HttpCode, Patch, Param } from '@nestjs/common';
import { CreateTransactionUseCase, CreateTransactionDto } from '../../application/use-cases/create-transaction.use-case';
import { UpdateTransactionStatusUseCase, UpdateTransactionStatusDto } from '../../application/use-cases/update-transaction-status.use-case';

@Controller('transactions')
export class TransactionController {
    constructor(
        private readonly createTransactionUseCase: CreateTransactionUseCase,
        private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateTransactionDto) {
        const result = await this.createTransactionUseCase.execute(dto);

        if (result.isFailure) {
            throw new BadRequestException(result.error);
        }

        return result.getValue();
    }

    @Patch(':id')
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateTransactionStatusDto) {
        const result = await this.updateTransactionStatusUseCase.execute(id, dto);

        if (result.isFailure) {
            throw new BadRequestException(result.error);
        }

        return { message: 'Transaction updated successfully' };
    }
}
