import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { paymentService } from '../services/paymentService';
import PaymentGatewayModal from '../components/billing/PaymentGatewayModal';

export default function StudentBilling() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amountToPay, setAmountToPay] = useState(3600); // Fixed for demo

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await paymentService.getMyPayments();
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900 dark:text-white">Mess Fee & Billing</h1>
          <p className="text-dark-500 dark:text-dark-400">Manage your mess fees and view payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-sm border border-dark-100 dark:border-dark-800"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
            <FiAlertCircle size={24} />
          </div>
          <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-2">Current Dues</h3>
          <p className="text-4xl font-display font-bold text-primary-600 dark:text-primary-400 mb-6">
            ₹{amountToPay.toFixed(2)}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full btn-primary py-3 flex justify-center items-center gap-2"
          >
            <FiCreditCard /> Pay Now
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-sm border border-dark-100 dark:border-dark-800"
        >
          <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-4">Payment History</h3>
          
          {loading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>
          ) : payments.length === 0 ? (
            <div className="text-center p-8 text-dark-500">
              <FiClock className="mx-auto mb-2 text-dark-300" size={32} />
              <p>No payment history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-4 bg-dark-50 dark:bg-dark-800/50 rounded-xl border border-dark-100 dark:border-dark-800">
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">Mess Fee - {payment.month}/{payment.year}</p>
                    <p className="text-sm text-dark-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-dark-900 dark:text-white">₹{payment.amount?.toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      payment.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      payment.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {payment.status === 'PAID' ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <PaymentGatewayModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        amount={amountToPay}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
