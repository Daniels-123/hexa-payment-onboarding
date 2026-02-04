import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setProduct, setLoading, setError } from '../features/product/productSlice';
import { PaymentFlow } from './PaymentFlow';

export const ProductScreen = () => {
    const dispatch = useAppDispatch();
    const { currentProduct, loading, error } = useAppSelector((state) => state.product);
    const [showPayment, setShowPayment] = useState(false);

    const fetchProduct = async () => {
        dispatch(setLoading(true));
        try {
            // Fetch products and take the first one for demo purposes
            // Ensure backend is running and reachable
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
            if (response.data && response.data.length > 0) {
                dispatch(setProduct(response.data[0])); // Take the first product
            } else {
                dispatch(setError('No products found. Please seed the database.'));
            }
        } catch (err) {
            dispatch(setError('Failed to fetch product. Ensure backend is running.'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (!currentProduct) {
            fetchProduct();
        }
    }, [dispatch, currentProduct]);

    const handlePayClick = () => {
        setShowPayment(true);
    };

    const handlePaymentClose = () => {
        setShowPayment(false);
    };

    const handlePaymentSuccess = () => {
        // Refresh product data to update stock
        fetchProduct();
    };


    if (loading && !currentProduct) {
        return (
            <div className="flex items-center justify-center h-screen text-primary-600">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error && !currentProduct) {
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]">
                {/* Image Section */}
                <div className="w-full h-1/2 md:w-1/2 md:h-full bg-gray-100 flex items-center justify-center relative overflow-hidden p-8">
                    <img 
                        src={currentProduct.imgUrl} 
                        alt={currentProduct.name} 
                        className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500"
                    />
                     {/* Stock Badge */}
                     <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm backdrop-blur-sm">
                        Stock: {currentProduct.stock}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 md:w-1/2 md:h-full md:overflow-y-auto p-8 flex flex-col relative">
                    <div className="flex justify-between items-start mb-6 gap-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                            {currentProduct.name}
                        </h1>
                        <span className="text-2xl md:text-3xl font-bold text-blue-600 shrink-0">
                            ${Number(currentProduct.price || 0).toLocaleString()}
                        </span>
                    </div>

                    <div className="text-gray-600 text-base leading-relaxed mb-8 flex-grow">
                         {currentProduct.description}
                    </div>

                    {/* Footer / Action */}
                    <div className="mt-auto">
                        <button
                            onClick={handlePayClick}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <span className="text-lg">Buy Now</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Free shipping on all orders
                        </p>
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL OVERLAY */}
            <div className={`fixed inset-0 z-50 transition-transform duration-500 ${showPayment ? 'translate-y-0' : 'translate-y-full'}`}>
                {showPayment && (
                    <PaymentFlow 
                        isOpen={showPayment} 
                        onClose={handlePaymentClose}
                        onSuccess={handlePaymentSuccess}
                    />
                )}
            </div>
        </div>
    );
};
