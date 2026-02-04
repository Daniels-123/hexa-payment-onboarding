import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Backdrop } from '../components/Backdrop/Backdrop';
import { updateCustomerData, setPaymentData, setStep, setStatus, setTransactionId, setTransactionError } from '../features/transaction/transactionSlice';
import { getCardType, formatCurrency } from '../utils/validation';
import axios from 'axios';

export const PaymentFlow = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentProduct } = useAppSelector((state) => state.product);
    const { customerData, cardToken, installments, step, status } = useAppSelector((state) => state.transaction);

    // Local state for non-persisted sensitive data (Card Number, etc)
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    
    // Redirect if no product
    useEffect(() => {
        if (!currentProduct) {
            navigate('/');
        }
    }, [currentProduct, navigate]);

    // Derived
    const cardType = getCardType(cardNumber);

    const handleProcessPayment = async () => {
        if (!currentProduct) return;
        dispatch(setStatus('PROCESSING'));

        try {
            // 1. Fetch Acceptance Token
            const pubKey = import.meta.env.VITE_WOMPI_PUB_KEY;
            const merchantsUrl = `https://api-sandbox.co.uat.wompi.dev/v1/merchants/${pubKey}`;
            const merchantRes = await axios.get(merchantsUrl);
            const acceptanceToken = merchantRes.data.data.presigned_acceptance.acceptance_token;

            // 2. Tokenize Card
            const tokensUrl = `https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards`;
            const tokenPayload = {
                number: cardNumber,
                cvc: cvc,
                exp_month: expiry.split('/')[0],
                exp_year: expiry.split('/')[1],
                card_holder: customerData.name
            };
            
            const tokenRes = await axios.post(tokensUrl, tokenPayload, {
                headers: { Authorization: `Bearer ${pubKey}` }
            });
            const validToken = tokenRes.data.data.id;
            
            // 3. Send to Backend
            const payload = {
                productId: currentProduct.id,
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                customerAddress: customerData.address,
                customerCity: customerData.city,
                amount: currentProduct.price,
                currency: 'COP',
                cardToken: validToken,
                installments: installments,
                acceptanceToken: acceptanceToken
            };

            const response = await axios.post('http://localhost:3000/transactions', payload);
            
            if (response.data && response.data.id) {
                 dispatch(setTransactionId(response.data.id));
                 
                 if (response.data.status === 'APPROVED') {
                     dispatch(setStatus('SUCCESS'));
                 } else {
                     dispatch(setStatus('ERROR'));
                     dispatch(setTransactionError(`Transaction was ${response.data.status}`));
                 }
                 navigate('/result');
            }
        } catch (error: any) {
            console.error(error);
            dispatch(setStatus('ERROR'));
            dispatch(setTransactionError(error.response?.data?.message || 'Transaction failed'));
            navigate('/result');
        }
    };

    if (!currentProduct) return null;

    // --- Back Layer Content ---
    const backLayer = (
        <div className="flex flex-col h-full bg-primary-800 p-6 pt-10">
             <div className="flex justify-between items-center text-white mb-6">
                 <button onClick={() => navigate('/')} className="text-white/80 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                 </button>
                 <span className="font-semibold">Checkout</span>
                 <div className="w-6"></div>
             </div>
             
             <div className="text-white/80 text-sm mb-1">Total to pay</div>
             <div className="text-4xl font-bold text-white mb-8">
                 {formatCurrency(currentProduct.price)}
             </div>

             <div className="bg-white/10 rounded-lg p-4 mb-4">
                 <div className="text-xs text-white/60 uppercase tracking-wide mb-2">Order Summary</div>
                 <div className="flex justify-between text-white text-sm mb-1">
                     <span>{currentProduct.name}</span>
                     <span>{formatCurrency(currentProduct.price)}</span>
                 </div>
                 <div className="flex justify-between text-white text-sm">
                     <span>Shipping</span>
                     <span>$0.00</span>
                 </div>
             </div>
        </div>
    );

    // --- Front Layer Content ---
    const frontLayer = (
        <div className="p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Details</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 pb-20">
                {/* Credit Card Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Card Information</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Card Number" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <div className="absolute right-3 top-3">
                            {cardType === 'VISA' && <span className="font-bold text-blue-800 italic">VISA</span>}
                            {cardType === 'MASTERCARD' && <span className="font-bold text-red-600">MC</span>}
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <input 
                            type="text" 
                            placeholder="MM/YY" 
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                         <input 
                            type="text" 
                            placeholder="CVC" 
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.substring(0, 4))}
                            className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <select 
                         value={installments}
                         onChange={(e) => dispatch(setPaymentData({ token: '', installments: Number(e.target.value) }))}
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {[1, 6, 12, 24, 36].map(i => <option key={i} value={i}>{i} Installments</option>)}
                    </select>
                </div>

                <hr className="border-gray-100 my-4" />

                {/* Delivery Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Shipping Address</label>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={customerData.name}
                        onChange={(e) => dispatch(updateCustomerData({ name: e.target.value }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:shadow-sm"
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={customerData.email}
                        onChange={(e) => dispatch(updateCustomerData({ email: e.target.value }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:shadow-sm"
                    />
                     <input 
                        type="tel" 
                        placeholder="Phone" 
                        value={customerData.phone}
                        onChange={(e) => dispatch(updateCustomerData({ phone: e.target.value }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:shadow-sm"
                    />
                     <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="Address" 
                            value={customerData.address}
                            onChange={(e) => dispatch(updateCustomerData({ address: e.target.value }))}
                            className="w-2/3 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:shadow-sm"
                        />
                         <input 
                            type="text" 
                            placeholder="City" 
                            value={customerData.city}
                            onChange={(e) => dispatch(updateCustomerData({ city: e.target.value }))}
                            className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:shadow-sm"
                        />
                     </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
                <button
                    onClick={handleProcessPayment}
                    disabled={status === 'PROCESSING'}
                    className={`
                        w-full py-4 rounded-xl shadow-lg text-white font-bold text-lg
                        flex items-center justify-center gap-2 transition-all
                        ${status === 'PROCESSING' ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 active:scale-95'}
                    `}
                >
                    {status === 'PROCESSING' ? (
                        <>Processing...</>
                    ) : (
                        <>Confirm Payment</>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <Backdrop 
            backLayer={backLayer}
            frontLayer={frontLayer}
            revealed={true} // Always active for this screen
        />
    );
};
