import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface TransactionState {
    step: 'PRODUCT' | 'PAYMENT' | 'RESULT';
    status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
    customerData: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
    };
    cardToken: string | null;
    installments: number;
    transactionId: string | null;
    externalTransactionId: string | null;
    error: string | null;
}

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

export const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        setStep: (state, action: PayloadAction<TransactionState['step']>) => {
            state.step = action.payload;
        },
        setStatus: (state, action: PayloadAction<TransactionState['status']>) => {
            state.status = action.payload;
        },
        updateCustomerData: (state, action: PayloadAction<Partial<TransactionState['customerData']>>) => {
            state.customerData = { ...state.customerData, ...action.payload };
        },
        setPaymentData: (state, action: PayloadAction<{ token: string; installments: number }>) => {
            state.cardToken = action.payload.token;
            state.installments = action.payload.installments;
        },
        setTransactionId: (state, action: PayloadAction<{ id: string; externalId?: string }>) => {
            state.transactionId = action.payload.id;
            if (action.payload.externalId) {
                state.externalTransactionId = action.payload.externalId;
            }
        },
        setTransactionError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        resetTransaction: () => {
            localStorage.removeItem('transactionState');
            return initialState;
        }
    },
});

export const {
    setStep, setStatus, updateCustomerData, setPaymentData, setTransactionId, setTransactionError, resetTransaction
} = transactionSlice.actions;

export default transactionSlice.reducer;
