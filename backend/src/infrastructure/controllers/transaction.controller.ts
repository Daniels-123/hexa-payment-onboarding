import { Controller, Post, Body, BadRequestException, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateTransactionUseCase, CreateTransactionDto } from '../../application/use-cases/create-transaction.use-case';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly createTransactionUseCase: CreateTransactionUseCase) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateTransactionDto) {
        const result = await this.createTransactionUseCase.execute(dto);

        if (result.isFailure) {
            // Map ROP ApplicationError to HTTP Exceptions
            throw new BadRequestException(result.error);
        }

        return result.getValue();
    }
}
