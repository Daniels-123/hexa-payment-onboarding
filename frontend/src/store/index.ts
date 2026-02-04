import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/product/productSlice';
import transactionReducer from '../features/transaction/transactionSlice';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('transactionState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('transactionState', serializedState);
    } catch {
        // ignore write errors
    }
};

export const store = configureStore({
    reducer: {
        product: productReducer,
        transaction: transactionReducer,
    },
    preloadedState: {
        transaction: loadState()
    }
});

store.subscribe(() => {
    saveState(store.getState().transaction);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
