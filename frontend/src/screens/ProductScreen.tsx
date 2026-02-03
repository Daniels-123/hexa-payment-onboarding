import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setProduct, setLoading, setError } from '../features/product/productSlice';

export const ProductScreen = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentProduct, loading, error } = useAppSelector((state) => state.product);

    useEffect(() => {
        const fetchProduct = async () => {
            dispatch(setLoading(true));
            try {
                // Fetch products and take the first one for demo purposes
                // Ensure backend is running at localhost:3000
                const response = await axios.get('http://localhost:3000/products');
                if (response.data && response.data.length > 0) {
                    dispatch(setProduct(response.data[0])); // Take the first product (e.g. Marvelous Mug)
                } else {
                    dispatch(setError('No products found. Please seed the database.'));
                }
            } catch (err) {
                dispatch(setError('Failed to fetch product. Ensure backend is running.'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (!currentProduct) {
            fetchProduct();
        }
    }, [dispatch, currentProduct]);

    const handlePayClick = () => {
        navigate('/payment');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-primary-600">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
                <div className="text-red-500 mb-4 text-xl">⚠️ {error}</div>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!currentProduct) return null;

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Image Section */}
            <div className="w-full h-1/2 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                <img 
                    src={currentProduct.imgUrl} 
                    alt={currentProduct.name} 
                    className="w-full h-full object-cover"
                />
                 {/* Stock Badge */}
                 <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm backdrop-blur-sm">
                    Stock: {currentProduct.stock}
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                        {currentProduct.name}
                    </h1>
                    <span className="text-2xl font-bold text-primary-600">
                        ${parseFloat(currentProduct.price.toString()).toLocaleString()}
                    </span>
                </div>

                <div className="text-gray-500 text-sm mb-6 flex-grow">
                     {currentProduct.description}
                </div>

                {/* Footer / Action */}
                <div className="mt-auto">
                    <button
                        onClick={handlePayClick}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Buy Now</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Free shipping on all orders
                    </p>
                </div>
            </div>
        </div>
    );
};
