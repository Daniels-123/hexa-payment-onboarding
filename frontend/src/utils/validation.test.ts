import { describe, it, expect } from 'vitest';
import { validateCardNumber, getCardType, formatCurrency } from './validation';

describe('Validation Utils', () => {
    describe('validateCardNumber', () => {
        it('should return true for valid Luhn numbers', () => {
            // Visa Test Card
            expect(validateCardNumber('4242424242424242')).toBe(true);
        });

        it('should return false for invalid length', () => {
            expect(validateCardNumber('123')).toBe(false);
        });

        it('should return false for invalid Luhn checksum', () => {
            expect(validateCardNumber('4242424242424241')).toBe(false);
        });

        it('should return false for non-numeric input', () => {
            expect(validateCardNumber('abcdefghijklmnop')).toBe(false);
        });
    });

    describe('getCardType', () => {
        it('should detect VISA', () => {
            expect(getCardType('4111')).toBe('VISA');
        });

        it('should detect MASTERCARD', () => {
            expect(getCardType('5500')).toBe('MASTERCARD');
        });

        it('should return UNKNOWN for others', () => {
            expect(getCardType('3712')).toBe('UNKNOWN');
        });
    });

    describe('formatCurrency', () => {
        it('should format COP correctly', () => {
            // Note: Exact string depends on locale, but should contain $ and the number
            const result = formatCurrency(15000);
            expect(result).toContain('15.000'); // Spanish locale uses dot for thousands
            // expect(result).toContain('$') // Might be COP or $ depends on node locale, stick to partial
        });
    });
});
