import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Backdrop } from '../components/Backdrop/Backdrop';
import { updateCustomerData, setPaymentData, setStatus, setTransactionId, setTransactionError, resetTransaction } from '../features/transaction/transactionSlice';
import { getCardType, formatCurrency } from '../utils/validation';
import axios from 'axios';

interface PaymentFlowProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Trigger stock refresh on parent
}

export const PaymentFlow = ({ isOpen, onClose, onSuccess }: PaymentFlowProps) => {
    const dispatch = useAppDispatch();
    const { currentProduct } = useAppSelector((state) => state.product);
    const { customerData, installments, status, error, transactionId } = useAppSelector((state) => state.transaction);

    // Local state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
             // Optional: Clean form if needed, or keep persistence
        }
    }, [isOpen]);

    const cardType = getCardType(cardNumber);

    const BASE_FEE = 5000;
    const DELIVERY_FEE = 4000;
    const totalAmount = Number(currentProduct?.price || 0) + BASE_FEE + DELIVERY_FEE;

    const handleProcessPayment = async () => {
        if (!currentProduct) return;

        // Validation
        if (!cardNumber || !expiry || !cvc || !customerData.name || !customerData.email || !customerData.address || !customerData.city) {
            dispatch(setStatus('ERROR'));
            dispatch(setTransactionError('Please fill in all required fields.'));
            return;
        }

        dispatch(setStatus('PROCESSING'));

        try {
            // 1. Fetch Acceptance Token
            const pubKey = import.meta.env.VITE_WOMPI_PUB_KEY;
            const merchantsRes = await axios.get(`https://api-sandbox.co.uat.wompi.dev/v1/merchants/${pubKey}`);
            const acceptanceToken = merchantsRes.data.data.presigned_acceptance.acceptance_token;

            // 2. Tokenize
            const tokenRes = await axios.post(
                `https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards`,
                {
                    number: cardNumber,
                    cvc: cvc,
                    exp_month: expiry.split('/')[0],
                    exp_year: expiry.split('/')[1],
                    card_holder: customerData.name
                },
                { headers: { Authorization: `Bearer ${pubKey}` } }
            );

            // 3. Backend
            const backendRes = await axios.post(`${import.meta.env.VITE_API_URL}/transactions`, {
                productId: currentProduct.id,
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                customerAddress: customerData.address,
                customerCity: customerData.city,
                amount: totalAmount, // Send Total with Fees
                currency: 'COP',
                cardToken: tokenRes.data.data.id,
                installments: installments,
                acceptanceToken: acceptanceToken
            });

            if (backendRes.data && backendRes.data.id) {
                const internalId = backendRes.data.id;
                const externalId = backendRes.data.externalTransactionId;
                
                dispatch(setTransactionId({ id: internalId, externalId: externalId }));
                
                const initialStatus = backendRes.data.status;

                if (initialStatus === 'APPROVED') {
                    dispatch(setStatus('SUCCESS'));
                    onSuccess(); 
                } else {
                     // For PENDING, DECLINED, ERROR:
                     // Keep PROCESSING, wait for polling to confirm final status.
                     // This prevents flashing "Error" if it updates to Approved, 
                     // and provides a consistent "Verifying..." experience.
                     dispatch(setStatus('PROCESSING'));
                }

                // Polling Check (5 seconds later)
                setTimeout(async () => {
                    try {
                        // 1. Check Wompi
                        const wompiRes = await axios.get(`https://api-sandbox.co.uat.wompi.dev/v1/transactions/${externalId}`);
                        const latestStatus = wompiRes.data.data.status;
                        
                        console.log(`Polling: Initial ${initialStatus} -> Latest ${latestStatus}`);

                        // 2. Sync if needed
                        // Always sync if status changed, or if we need to show the final error now
                        if (latestStatus !== initialStatus || initialStatus !== 'APPROVED') {
                             // Correct logic:
                             // If it became APPROVED -> Success
                             // If it stayed DECLINED/ERROR -> Show Error NOW.
                             // If it stayed PENDING -> Show Error? Or keep Processing? 
                             // User said "Update when finished". We'll assume 5s is the limit.
                            
                            if (latestStatus === 'APPROVED') {
                                // Sync Backend
                                await axios.patch(`${import.meta.env.VITE_API_URL}/transactions/${internalId}`, {
                                    status: latestStatus,
                                    externalId: externalId
                                });
                                dispatch(setStatus('SUCCESS'));
                                onSuccess();
                            } else {
                                // It is NOT approved (Declined, Error, Voided, or still Pending)
                                // We must show the result now.
                                // Sync Backend just in case it changed
                                if (latestStatus !== initialStatus) {
                                    await axios.patch(`${import.meta.env.VITE_API_URL}/transactions/${internalId}`, {
                                        status: latestStatus,
                                        externalId: externalId
                                    });
                                }
                                
                                dispatch(setStatus('ERROR'));
                                dispatch(setTransactionError(`Transaction ${latestStatus}`));
                            }
                        }
                    } catch (pollErr) {
                        console.error('Polling verification failed', pollErr);
                        dispatch(setStatus('ERROR'));
                        dispatch(setTransactionError('Verification failed. Please check your email.'));
                    }
                }, 5000);
            }
        } catch (err: any) {
            console.error(err);
            dispatch(setStatus('ERROR'));
            dispatch(setTransactionError(err.response?.data?.message || 'Payment Failed'));
        }
    };

    const handleClose = () => {
        dispatch(resetTransaction());
        onClose();
    };

    if (!currentProduct) return null;

    // --- RESULT VIEW ---
    // Show Result only if SUCCESS or ERROR.
    // If PROCESSING (Pending), we show the form DISABLED or a specific spinner.
    // Currently logic: if (status === 'SUCCESS' || status === 'ERROR') -> show Result.
    
    // We want to differentiate "Processing submission" vs "Verifying PENDING".
    // Re-using PROCESSING is fine, it keeps the form disabled.
    // To give better feedback, we can change the button text based on status.

    if (status === 'SUCCESS' || status === 'ERROR') {
         const resultLayer = (
            <div className="flex flex-col h-full bg-white relative items-center justify-center p-6 text-center">
                {status === 'SUCCESS' ? (
                    <div className="items-center flex flex-col">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 mb-8">ID: {transactionId}</p>
                    </div>
                ) : (
                    <div className="items-center flex flex-col">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                        <p className="text-red-500 mb-8">{error}</p>
                    </div>
                )}
                <button
                    onClick={handleClose} // Closes modal and resets
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
                >
                    Close & Continue
                </button>
            </div>
         );

         return (
             <Backdrop 
                backLayer={<div className="h-full bg-primary-800"></div>} // Simple background
                frontLayer={resultLayer}
                revealed={isOpen}
             />
         );
    }

    // --- FORM VIEW ---
    const backLayer = (
        <div className="flex flex-col h-full bg-primary-800 p-6 pt-10">
             <div className="flex justify-between items-center text-white mb-6">
                 <button onClick={onClose} className="text-white/80 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
                 <span className="font-semibold">Checkout</span>
                 <div className="w-6"></div>
             </div>
             
             <div className="text-white/80 text-sm mb-1">Total to pay</div>
             <div className="text-4xl font-bold text-white mb-8">
                 {formatCurrency(totalAmount)}
             </div>

             <div className="bg-white/10 rounded-lg p-4 mb-4">
                 <div className="text-xs text-white/60 uppercase tracking-wide mb-2">Order Summary</div>
                 <div className="flex justify-between text-white text-sm mb-1">
                     <span>{currentProduct.name}</span>
                     <span>{formatCurrency(currentProduct.price)}</span>
                 </div>
                 <div className="flex justify-between text-white text-sm mb-1">
                     <span>Base Fee</span>
                     <span>{formatCurrency(BASE_FEE)}</span>
                 </div>
                 <div className="flex justify-between text-white text-sm">
                     <span>Shipping</span>
                     <span>{formatCurrency(DELIVERY_FEE)}</span>
                 </div>
             </div>
        </div>
    );

    const frontLayer = (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-6 pb-2 shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 4) val = val.substring(0, 4);
                                
                                // Month Validation
                                if (val.length >= 2) {
                                  const month = parseInt(val.substring(0, 2));
                                  if (month > 12 || month === 0) {
                                      // Invalid month, keep only the first char if it was valid, or nothing
                                      // Or better: just don't accept the last typed char if it makes it invalid
                                      // Implementation: If invalid, keep old value? 
                                      // Simplest effective UX: don't allow typing > 1 for first digit if second isn't there yet?
                                      // Let's just strip the change if month > 12
                                      return; 
                                  }
                                }
                                
                                if (val.length > 2) {
                                    val = `${val.substring(0, 2)}/${val.substring(2)}`;
                                }
                                setExpiry(val);
                            }}
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

            {/* Sticky Footer */}
            <div className="p-6 bg-white border-t border-gray-50 shrink-0">
                <button
                    onClick={handleProcessPayment}
                    disabled={status === 'PROCESSING'}
                    className={`
                        w-full py-4 rounded-xl shadow-lg text-white font-bold text-lg
                        flex items-center justify-center gap-2 transition-all
                        ${status === 'PROCESSING' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                    `}
                >
                    {status === 'PROCESSING' ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying Payment...
                        </>
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
            revealed={isOpen} 
        />
    );
};
