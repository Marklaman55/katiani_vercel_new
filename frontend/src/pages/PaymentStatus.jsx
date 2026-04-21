import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const checkoutID = searchParams.get('checkoutID');
  const [status, setStatus] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkoutID) return;

    const checkStatus = async () => {
      try {
        const data = await apiRequest(`/payments/status/${checkoutID}`);
        if (data.status === 'completed') {
          setStatus('success');
          localStorage.setItem('lastBooking', JSON.stringify(data.booking));
          toast.success("Payment confirmed!");
          setTimeout(() => navigate('/success'), 2000);
        } else if (data.status === 'failed') {
          setStatus('failed');
          toast.error("Payment failed or cancelled.");
        }
      } catch (err) {
        console.error("Status check failed:", err.message);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === 'pending') setStatus('timeout');
    }, 60000); // 1 minute timeout

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkoutID, navigate, status]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center"
        >
          {status === 'pending' && (
            <>
              <Loader2 className="w-16 h-16 text-brand-accent animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Confirming Payment</h1>
              <p className="text-gray-600">Please check your phone for the M-Pesa prompt and enter your PIN.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Redirecting you to your booking details...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">The transaction was cancelled or failed. Please try again.</p>
              <button onClick={() => navigate('/book')} className="btn-primary w-full">Try Again</button>
            </>
          )}

          {status === 'timeout' && (
            <>
              <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Request Timed Out</h1>
              <p className="text-gray-600 mb-6">We didn't receive a response from M-Pesa in time.</p>
              <button onClick={() => navigate('/book')} className="btn-primary w-full">Try Again</button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentStatus;
