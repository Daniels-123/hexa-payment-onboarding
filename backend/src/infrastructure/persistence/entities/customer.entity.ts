import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DeliveryEntity } from './delivery.entity';

@Entity('customers')
export class CustomerEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullName: string;

    @Column()
    email: string;

    @Column()
    phoneNumber: string;

    @Column()
    address: string;

    @Column()
    city: string;

    @OneToMany(() => DeliveryEntity, (delivery: DeliveryEntity) => delivery.customer)
    deliveries: DeliveryEntity[];
}
