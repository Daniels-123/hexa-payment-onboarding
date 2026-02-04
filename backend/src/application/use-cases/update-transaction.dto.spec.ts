import { validate } from 'class-validator';
import { UpdateTransactionStatusDto } from './update-transaction-status.use-case';
import { plainToInstance } from 'class-transformer';
import { TransactionStatus } from '../../domain/entities/transaction';

describe('UpdateTransactionStatusDto', () => {
    it('should validate a correct dto', async () => {
        const dto = plainToInstance(UpdateTransactionStatusDto, {
            status: TransactionStatus.APPROVED,
            externalId: 'ext_123',
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail with invalid status', async () => {
        const dto = plainToInstance(UpdateTransactionStatusDto, {
            status: 'INVALID_STATUS',
            externalId: 'ext_123',
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('status');
    });

    it('should fail with missing externalId', async () => {
        const dto = plainToInstance(UpdateTransactionStatusDto, {
            status: TransactionStatus.APPROVED,
            // externalId missing
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('externalId');
    });
});
