import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resetTransaction } from '../features/transaction/transactionSlice';
import { setProduct, clearProduct } from '../features/product/productSlice'; // To force re-fetch or clear

export const ResultScreen = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { status, error, transactionId } = useAppSelector((state) => state.transaction);

    const handleHome = () => {
        dispatch(resetTransaction());
        dispatch(clearProduct()); 
        navigate('/');
    };

    // Safety: if accessing result without transaction attempt, go home
    useEffect(() => {
        if (status === 'IDLE') {
            navigate('/');
        }
    }, [status, navigate]);

    if (status === 'IDLE') return null;

    return (
        <div className="flex flex-col h-screen items-center justify-center p-6 text-center bg-white">
            {status === 'SUCCESS' ? (
                <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-500 mb-8">
                        Your transaction has been approved.
                        <br />
                        <span className="text-xs">ID: {transactionId || 'N/A'}</span>
                    </p>
                </>
            ) : (
                <>
                     <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-red-500 mb-8">
                        {error || 'Something went wrong.'}
                    </p>
                </>
            )}

            <button
                onClick={handleHome}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
            >
                Back to Home
            </button>
        </div>
    );
};
