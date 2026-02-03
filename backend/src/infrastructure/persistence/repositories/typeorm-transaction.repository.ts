import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryPort } from '../../../domain/ports/spi/transaction-repository.port';
import { Transaction, TransactionStatus } from '../../../domain/entities/transaction';
import { TransactionEntity } from '../entities/transaction.entity';
import { ProductEntity } from '../entities/product.entity';
import { DeliveryEntity } from '../entities/delivery.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { Delivery, DeliveryStatus } from '../../../domain/entities/delivery';
import { Customer } from '../../../domain/entities/customer';
import { Product } from '../../../domain/entities/product';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryPort {
    constructor(
        @InjectRepository(TransactionEntity)
        private readonly repo: Repository<TransactionEntity>,
    ) { }

    async save(transaction: Transaction): Promise<Transaction> {
        console.log('DEBUG: Saving transaction', transaction);
        const entity = this.toPersistence(transaction);
        console.log('DEBUG: Persisting entity', entity);
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }

    async findById(id: string): Promise<Transaction | null> {
        const transaction = await this.repo.findOne({
            where: { id },
            relations: ['product', 'delivery', 'delivery.customer'],
        });
        return transaction ? this.toDomain(transaction) : null;
    }

    async update(transaction: Transaction): Promise<void> {
        console.log('DEBUG: Updating transaction', transaction.id, transaction.status);
        // Use update() to modify specific fields and avoid cascading issues with save()
        await this.repo.update(transaction.id, {
            status: transaction.status,
            externalTransactionId: transaction.externalTransactionId ?? "",
        });
    }

    private toDomain(entity: TransactionEntity): Transaction {
        const product = new Product(
            entity.product.id,
            entity.product.name,
            entity.product.description,
            Number(entity.product.price),
            entity.product.stock,
            entity.product.imgUrl
        );

        const customer = new Customer(
            entity.delivery.customer.id,
            entity.delivery.customer.fullName,
            entity.delivery.customer.email,
            entity.delivery.customer.phoneNumber,
            entity.delivery.customer.address,
            entity.delivery.customer.city
        );

        const delivery = new Delivery(
            entity.delivery.id,
            entity.delivery.status as DeliveryStatus,
            Number(entity.delivery.fee),
            customer
        );

        return new Transaction(
            entity.id,
            Number(entity.amount),
            entity.currency,
            entity.status as TransactionStatus,
            entity.reference,
            product,
            delivery,
            entity.createdAt,
            entity.externalTransactionId
        );
    }

    private toPersistence(domain: Transaction): TransactionEntity {
        const entity = new TransactionEntity();
        if (domain.id) entity.id = domain.id;
        entity.amount = domain.amount;
        entity.currency = domain.currency;
        entity.status = domain.status;
        entity.reference = domain.reference;
        entity.createdAt = domain.createdAt;
        entity.externalTransactionId = domain.externalTransactionId ?? "";

        // Map Product
        const productEntity = new ProductEntity();
        productEntity.id = domain.product.id;
        entity.product = productEntity;

        // Map Delivery & Customer (Cascading)
        const deliveryEntity = new DeliveryEntity();
        if (domain.delivery.id) deliveryEntity.id = domain.delivery.id;
        deliveryEntity.status = domain.delivery.status;
        deliveryEntity.fee = domain.delivery.fee;

        const customerEntity = new CustomerEntity();
        if (domain.delivery.customer.id) customerEntity.id = domain.delivery.customer.id;
        customerEntity.fullName = domain.delivery.customer.fullName;
        customerEntity.email = domain.delivery.customer.email;
        customerEntity.phoneNumber = domain.delivery.customer.phoneNumber;
        customerEntity.address = domain.delivery.customer.address;
        customerEntity.city = domain.delivery.customer.city;

        deliveryEntity.customer = customerEntity;
        entity.delivery = deliveryEntity;

        return entity;
    }
}
