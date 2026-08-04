import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { paymentService } from '../../services/paymentService';
import toast from 'react-hot-toast';

export default function PaymentGatewayModal({ isOpen, onClose, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await paymentService.getConfig();
        setConfig(res.data);
      } catch (error) {
        console.error("Failed to load payment config", error);
      }
    };
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!config?.keyId) {
      toast.error('Payment gateway not configured');
      return;
    }

    setLoading(true);
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Create order
      const orderRes = await paymentService.createOrder({ amount, month, year });
      const order = orderRes.data;

      const options = {
        key: config.keyId,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'North Mess',
        description: 'Mess Fee Payment',
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment verified successfully!');
            onSuccess(order);
            onClose();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        >
          <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-dark-900 dark:text-white">Secure Payment</h3>
            <button onClick={onClose} className="p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg">
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-1">Amount to Pay</p>
              <p className="text-3xl font-display font-bold text-primary-700 dark:text-primary-300">
                ₹{amount?.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Proceed to Pay'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
