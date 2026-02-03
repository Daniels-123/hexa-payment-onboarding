import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { TransactionEntity } from './transaction.entity';

@Entity('deliveries')
export class DeliveryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    status: string; // PENDING, SHIPPED, DELIVERED

    @Column('decimal', { precision: 10, scale: 2 })
    fee: number;

    @ManyToOne(() => CustomerEntity, (customer) => customer.deliveries)
    customer: CustomerEntity;

    @OneToOne(() => TransactionEntity, (transaction) => transaction.delivery)
    transaction: TransactionEntity;
}
