import { describe, it, expect } from 'vitest';
import transactionReducer, { setStep, updateCustomerData, setPaymentData, resetTransaction, type TransactionState } from './transactionSlice';

describe('transactionSlice', () => {
    const initialState: TransactionState = {
        step: 'PRODUCT',
        status: 'IDLE',
        customerData: {
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
        },
        cardToken: null,
        installments: 1,
        transactionId: null,
        externalTransactionId: null,
        error: null,
    };

    it('should handle initial state', () => {
        // @ts-ignore
        expect(transactionReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setStep', () => {
        // @ts-ignore
        const actual = transactionReducer(initialState, setStep('PAYMENT'));
        expect(actual.step).toBe('PAYMENT');
    });

    it('should handle updateCustomerData', () => {
        const actual = transactionReducer(initialState, updateCustomerData({ name: 'John Doe' }));
        expect(actual.customerData.name).toBe('John Doe');
        expect(actual.customerData.email).toBe(''); // Others remain
    });

    it('should handle setPaymentData', () => {
        const actual = transactionReducer(initialState, setPaymentData({ token: 'tok_123', installments: 6 }));
        expect(actual.cardToken).toBe('tok_123');
        expect(actual.installments).toBe(6);
    });

    it('should handle resetTransaction', () => {
        const modifiedState = { ...initialState, step: 'RESULT' as const, installments: 12 };
        const actual = transactionReducer(modifiedState, resetTransaction());
        expect(actual).toEqual(initialState);
    });
});
