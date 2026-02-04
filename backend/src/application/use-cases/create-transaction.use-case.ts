import { Injectable, Inject } from '@nestjs/common';
import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/spi/transaction-repository.port';
import { PaymentGatewayPort } from '../../domain/ports/spi/payment-gateway.port';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction';
import { Product } from '../../domain/entities/product';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery';
import { Customer } from '../../domain/entities/customer';
import { Result, ApplicationError } from '../../domain/logic/result';

import { IsString, IsNumber, IsEmail, Min, IsUUID } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @IsUUID()
    productId: string;

    @IsString()
    customerName: string;

    @IsEmail()
    customerEmail: string;

    @IsString()
    customerPhone: string;

    @IsString()
    customerAddress: string;

    @IsString()
    customerCity: string;

    @IsNumber()
    @Min(1)
    amount: number; // Includes Fee

    @IsString()
    currency: string;

    @IsString()
    cardToken: string;

    @IsNumber()
    @Min(1)
    installments: number;

    @IsString()
    acceptanceToken: string;
}

@Injectable()
export class CreateTransactionUseCase {
    constructor(
        @Inject(ProductRepositoryPort)
        private readonly productRepo: ProductRepositoryPort,
        @Inject(TransactionRepositoryPort)
        private readonly transactionRepo: TransactionRepositoryPort,
        @Inject(PaymentGatewayPort)
        private readonly paymentGateway: PaymentGatewayPort,
    ) { }

    async execute(dto: CreateTransactionDto): Promise<Result<Transaction, ApplicationError>> {
        // 1. Get Product
        const product = await this.productRepo.findById(dto.productId);
        if (!product) {
            return Result.fail({ message: 'Product not found', code: 'PRODUCT_NOT_FOUND' });
        }
        if (product.stock < 1) {
            return Result.fail({ message: 'Product out of stock', code: 'PRODUCT_OUT_OF_STOCK' });
        }

        // 2. Prepare Data
        const customer = new Customer(
            '', // ID will be generated
            dto.customerName,
            dto.customerEmail,
            dto.customerPhone,
            dto.customerAddress,
            dto.customerCity,
        );

        const delivery = new Delivery(
            '',
            DeliveryStatus.PENDING,
            0, // Fee Logic could be here, assumming included or 0 for now
            customer,
        );

        const initialTransaction = new Transaction(
            '',
            dto.amount,
            dto.currency,
            TransactionStatus.PENDING,
            `REF-${Date.now()}`,
            product,
            delivery,
            new Date(),
        );

        // 3. Save PENDING Transaction
        const savedTransaction = await this.transactionRepo.save(initialTransaction);

        // 4. Call Payment Gateway
        const paymentResult = await this.paymentGateway.processPayment(
            dto.amount,
            dto.currency,
            dto.cardToken,
            dto.installments,
            dto.acceptanceToken,
            dto.customerEmail,
        );

        // 5. Update based on result
        if (paymentResult.status === 'APPROVED') {
            savedTransaction.status = TransactionStatus.APPROVED;
            savedTransaction.externalTransactionId = paymentResult.id;

            // 5a. Deduct Stock
            await this.productRepo.updateStock(product.id, product.stock - 1);

            // 5b. Update Delivery ? (Already created with Transaction cascade)
        } else {
            savedTransaction.status = TransactionStatus.DECLINED; // Or ERROR/VOIDED
            savedTransaction.externalTransactionId = paymentResult.id;
            // Don't deduct stock
        }

        // 6. Save Updates
        await this.transactionRepo.update(savedTransaction);

        return Result.ok(savedTransaction);
    }
}
