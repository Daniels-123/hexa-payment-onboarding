import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/spi/transaction-repository.port';
import { PaymentGatewayPort } from '../../domain/ports/spi/payment-gateway.port';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction';
import { Product } from '../../domain/entities/product';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery';
import { Customer } from '../../domain/entities/customer';

export interface CreateTransactionDto {
    productId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    amount: number; // Includes Fee
    currency: string;
    cardToken: string;
    installments: number;
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

    async execute(dto: CreateTransactionDto): Promise<Transaction> {
        // 1. Get Product
        const product = await this.productRepo.findById(dto.productId);
        if (!product) {
            throw new BadRequestException('Product not found');
        }
        if (product.stock < 1) {
            throw new BadRequestException('Product out of stock');
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

        return savedTransaction;
    }
}
