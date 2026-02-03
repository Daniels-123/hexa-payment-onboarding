export class Result<T, E> {
    public isSuccess: boolean;
    public isFailure: boolean;
    public error: E | null;
    private _value: T | null;

    private constructor(isSuccess: boolean, error: E | null, value: T | null) {
        if (isSuccess && error) {
            throw new Error('InvalidOperation: A result cannot be successful and contain an error');
        }
        if (!isSuccess && !error) {
            throw new Error('InvalidOperation: A failing result needs to contain an error message');
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
    }

    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error("Can't get the value of an error result. Use 'errorValue' instead.");
        }
        return this._value!;
    }

    public static ok<U, F>(value: U): Result<U, F> {
        return new Result<U, F>(true, null, value);
    }

    public static fail<U, F>(error: F): Result<U, F> {
        return new Result<U, F>(false, error, null);
    }
}

export type ApplicationError = {
    message: string;
    code: string;
};
