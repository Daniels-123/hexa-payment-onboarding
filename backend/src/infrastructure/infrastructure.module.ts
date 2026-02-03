import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProductEntity } from './persistence/entities/product.entity';
import { TransactionEntity } from './persistence/entities/transaction.entity';
import { CustomerEntity } from './persistence/entities/customer.entity';
import { DeliveryEntity } from './persistence/entities/delivery.entity';
import { TypeOrmProductRepository } from './persistence/repositories/typeorm-product.repository';
import { TypeOrmTransactionRepository } from './persistence/repositories/typeorm-transaction.repository';
import { PaymentGatewayAdapter } from './external/payment-gateway.adapter';
import { ProductRepositoryPort } from '../domain/ports/spi/product-repository.port';
import { TransactionRepositoryPort } from '../domain/ports/spi/transaction-repository.port';
import { PaymentGatewayPort } from '../domain/ports/spi/payment-gateway.port';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductEntity,
            TransactionEntity,
            CustomerEntity,
            DeliveryEntity,
        ]),
        HttpModule,
    ],
    providers: [
        {
            provide: ProductRepositoryPort,
            useClass: TypeOrmProductRepository,
        },
        {
            provide: TransactionRepositoryPort,
            useClass: TypeOrmTransactionRepository,
        },
        {
            provide: PaymentGatewayPort,
            useClass: PaymentGatewayAdapter,
        },
    ],
    exports: [
        ProductRepositoryPort,
        TransactionRepositoryPort,
        PaymentGatewayPort,
    ],
})
export class InfrastructureModule { }
