import { Product } from './product';
import { Customer } from './customer';
import { Delivery, DeliveryStatus } from './delivery';
import { Transaction, TransactionStatus } from './transaction';

describe('Domain Entities', () => {
    describe('Product', () => {
        it('should create a product instance', () => {
            const product = new Product('1', 'Name', 'Desc', 100, 10, 'url');
            expect(product.id).toBe('1');
            expect(product.name).toBe('Name');
            expect(product.price).toBe(100);
            expect(product.stock).toBe(10);
        });
    });

    describe('Customer', () => {
        it('should create a customer instance', () => {
            const customer = new Customer('1', 'Name', 'email@test.com', '123', 'Address', 'City');
            expect(customer.id).toBe('1');
            expect(customer.fullName).toBe('Name');
            expect(customer.email).toBe('email@test.com');
        });
    });

    describe('Delivery', () => {
        it('should create a delivery instance', () => {
            const customer = new Customer('1', 'Name', 'email@test.com', '123', 'Address', 'City');
            const delivery = new Delivery('1', DeliveryStatus.PENDING, 5, customer);
            expect(delivery.id).toBe('1');
            expect(delivery.status).toBe(DeliveryStatus.PENDING);
            expect(delivery.fee).toBe(5);
            expect(delivery.customer).toBe(customer);
        });
    });

    describe('Transaction', () => {
        it('should create a transaction instance', () => {
            const product = new Product('1', 'Name', 'Desc', 100, 10, 'url');
            const customer = new Customer('1', 'Name', 'email@test.com', '123', 'Address', 'City');
            const delivery = new Delivery('1', DeliveryStatus.PENDING, 5, customer);
            const date = new Date();
            const transaction = new Transaction('1', 105, 'COP', TransactionStatus.PENDING, 'REF', product, delivery, date);

            expect(transaction.id).toBe('1');
            expect(transaction.amount).toBe(105);
            expect(transaction.status).toBe(TransactionStatus.PENDING);
            expect(transaction.product).toBe(product);
            expect(transaction.delivery).toBe(delivery);
            expect(transaction.createdAt).toBe(date);
        });
    });
});
