import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ProductEntity } from './product.entity';
import { DeliveryEntity } from './delivery.entity';

@Entity('transactions')
export class TransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column()
    status: string; // PENDING, APPROVED, DECLINED, VOIDED, ERROR

    @Column()
    reference: string;

    @ManyToOne(() => ProductEntity)
    product: ProductEntity;

    @OneToOne(() => DeliveryEntity, (delivery) => delivery.transaction, { cascade: true })
    @JoinColumn()
    delivery: DeliveryEntity;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    externalTransactionId: string;
}
