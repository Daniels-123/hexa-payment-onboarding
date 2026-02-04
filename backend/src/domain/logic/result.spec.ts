import { Result } from './result';

describe('Result', () => {
    it('should create a success result', () => {
        const result = Result.ok<string, string>('Success');
        expect(result.isSuccess).toBe(true);
        expect(result.isFailure).toBe(false);
        expect(result.getValue()).toBe('Success');
    });

    it('should create a failure result', () => {
        const result = Result.fail<string, string>('Error');
        expect(result.isSuccess).toBe(false);
        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Error');
    });

    it('should throw error when accessing value of failure', () => {
        const result = Result.fail<string, string>('Error');
        expect(() => result.getValue()).toThrow();
    });

    it('should return null for void success', () => {
        const result = Result.ok<void, string>(undefined);
        expect(result.getValue()).toBeUndefined();
    });
});
