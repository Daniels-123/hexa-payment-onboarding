import { Transaction } from '../../entities/transaction';

export interface TransactionRepositoryPort {
    save(transaction: Transaction): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    update(transaction: Transaction): Promise<void>;
}

export const TransactionRepositoryPort = Symbol('TransactionRepositoryPort');
