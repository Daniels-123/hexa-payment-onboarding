import { Customer } from './customer';

export enum DeliveryStatus {
    PENDING = 'PENDING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
}

export class Delivery {
    constructor(
        public readonly id: string,
        public status: DeliveryStatus,
        public fee: number,
        public customer: Customer,
    ) { }
}
