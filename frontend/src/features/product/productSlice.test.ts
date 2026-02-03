import { describe, it, expect } from 'vitest';
import productReducer, { setProduct, decrementStock, clearProduct } from './productSlice';

describe('productSlice', () => {
    const initialState = {
        currentProduct: null,
        loading: false,
        error: null,
    };

    const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Desc',
        price: 100,
        stock: 10,
        imgUrl: 'http://test.com/img.jpg'
    };

    it('should handle initial state', () => {
        expect(productReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setProduct', () => {
        const actual = productReducer(initialState, setProduct(mockProduct));
        expect(actual.currentProduct).toEqual(mockProduct);
    });

    it('should handle decrementStock', () => {
        const stateWithProduct = { ...initialState, currentProduct: mockProduct };
        const actual = productReducer(stateWithProduct, decrementStock());
        expect(actual.currentProduct?.stock).toBe(9);
    });

    it('should not decrement stock below 0', () => {
        const zeroStockProduct = { ...mockProduct, stock: 0 };
        const stateWithProduct = { ...initialState, currentProduct: zeroStockProduct };
        const actual = productReducer(stateWithProduct, decrementStock());
        expect(actual.currentProduct?.stock).toBe(0);
    });

    it('should handle clearProduct', () => {
        const stateWithProduct = { ...initialState, currentProduct: mockProduct };
        const actual = productReducer(stateWithProduct, clearProduct());
        expect(actual.currentProduct).toBeNull();
    });
});
