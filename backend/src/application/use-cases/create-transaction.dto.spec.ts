import { validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.use-case';
import { plainToInstance } from 'class-transformer';

describe('CreateTransactionDto', () => {
    it('should validate a correct dto', async () => {
        const dto = plainToInstance(CreateTransactionDto, {
            productId: '123e4567-e89b-12d3-a456-426614174000',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '1234567890',
            customerAddress: '123 St',
            customerCity: 'City',
            amount: 1000,
            currency: 'COP',
            cardToken: 'token_123',
            installments: 1,
            acceptanceToken: 'accept_123',
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail with invalid email', async () => {
        const dto = plainToInstance(CreateTransactionDto, {
            productId: '123e4567-e89b-12d3-a456-426614174000',
            customerName: 'John Doe',
            customerEmail: 'invalid-email',
            customerPhone: '1234567890',
            customerAddress: '123 St',
            customerCity: 'City',
            amount: 1000,
            currency: 'COP',
            cardToken: 'token_123',
            installments: 1,
            acceptanceToken: 'accept_123',
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('customerEmail');
    });

    it('should fail with invalid amount', async () => {
        const dto = plainToInstance(CreateTransactionDto, {
            productId: '123e4567-e89b-12d3-a456-426614174000',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '1234567890',
            customerAddress: '123 St',
            customerCity: 'City',
            amount: 0, // Invalid
            currency: 'COP',
            cardToken: 'token_123',
            installments: 1,
            acceptanceToken: 'accept_123',
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('amount');
    });
});
