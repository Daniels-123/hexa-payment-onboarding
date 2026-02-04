import { ProductEntity } from './product.entity';
import { CustomerEntity } from './customer.entity';
import { DeliveryEntity } from './delivery.entity';
import { TransactionEntity } from './transaction.entity';

describe('Infrastructure Entities', () => {
    it('should create ProductEntity', () => {
        const entity = new ProductEntity();
        entity.id = '1';
        entity.name = 'Test';
        expect(entity.id).toBe('1');
    });

    it('should create CustomerEntity', () => {
        const entity = new CustomerEntity();
        entity.id = '1';
        entity.fullName = 'Test';
        expect(entity.id).toBe('1');
    });

    it('should create DeliveryEntity', () => {
        const entity = new DeliveryEntity();
        entity.id = '1';
        entity.fee = 100;
        expect(entity.id).toBe('1');
    });

    it('should create TransactionEntity', () => {
        const entity = new TransactionEntity();
        entity.id = '1';
        entity.amount = 100;
        expect(entity.id).toBe('1');
    });
});
