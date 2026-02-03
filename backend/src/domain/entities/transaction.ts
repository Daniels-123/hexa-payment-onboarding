import { Product } from './product';
import { Delivery } from './delivery';

export enum TransactionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    VOIDED = 'VOIDED',
    ERROR = 'ERROR',
}

export class Transaction {
    constructor(
        public readonly id: string,
        public amount: number,
        public currency: string,
        public status: TransactionStatus,
        public reference: string,
        public product: Product,
        public delivery: Delivery,
        public createdAt: Date,
        public externalTransactionId?: string,
    ) { }
}
