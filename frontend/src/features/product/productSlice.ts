import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imgUrl: string;
}

interface ProductState {
    currentProduct: Product | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    currentProduct: null,
    loading: false,
    error: null,
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProduct: (state, action: PayloadAction<Product>) => {
            state.currentProduct = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        decrementStock: (state) => {
            if (state.currentProduct && state.currentProduct.stock > 0) {
                state.currentProduct.stock -= 1;
            }
        },
        clearProduct: (state) => {
            state.currentProduct = null;
        },
    },
});

export const { setProduct, setLoading, setError, decrementStock, clearProduct } = productSlice.actions;
export default productSlice.reducer;
