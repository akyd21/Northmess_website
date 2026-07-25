import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiCheck, FiShield, FiCreditCard, FiSmartphone,
  FiGlobe, FiLock, FiCheckCircle, FiDownload, FiArrowRight, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PaymentGatewayModal({ isOpen, onClose, summary, onPaymentSuccess }) {
  const [step, setStep] = useState('METHOD'); // 'METHOD' | 'DETAILS' | 'OTP' | 'PROCESSING' | 'SUCCESS'
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'

  // Form Fields
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // OTP
  const [otp, setOtp] = useState('');

  // Transaction Receipt Data
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('METHOD');
      setMethod('UPI');
      setUpiId('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardName('');
      setOtp('');
      setReceiptData(null);
    }
  }, [isOpen]);

  if (!isOpen || !summary) return null;

  const detectCardBrand = (num) => {
    const cleaned = num.replace(/\s+/g, '');
    if (/^4/.test(cleaned)) return { name: 'Visa', logo: '💳 Visa' };
    if (/^(5[1-5]|2[2-7])/.test(cleaned)) return { name: 'Mastercard', logo: '💳 Mastercard' };
    if (/^6/.test(cleaned)) return { name: 'RuPay', logo: '💳 RuPay' };
    return { name: 'Card', logo: '💳 Card' };
  };

  const handleFormatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleFormatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    if (method === 'UPI' && !upiId.trim() && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    if (method === 'CARD') {
      if (cardNumber.replace(/\s+/g, '').length < 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || !cardCvv) {
        toast.error('Please fill in card expiry and CVV');
        return;
      }
    }

    setStep('OTP');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter valid 6-digit OTP (e.g. 123456)');
      return;
    }

    setStep('PROCESSING');

    setTimeout(() => {
      const txnId = `PAY-${Date.now().toString().slice(-8)}`;
      const timestamp = new Date().toLocaleString();

      const receipt = {
        transactionId: txnId,
        amount: summary.totalPayable,
        monthName: summary.monthName,
        year: summary.year,
        method: method === 'UPI' ? `UPI (${upiId || 'GPay/QR'})` : method === 'CARD' ? `Card (${detectCardBrand(cardNumber).name})` : `NetBanking (${selectedBank})`,
        paidAt: timestamp,
        chargeableDays: summary.chargeableDays,
        dailyRate: summary.dailyRate,
      };

      setReceiptData(receipt);
      setStep('SUCCESS');
      toast.success('Payment Processed Successfully!');
      if (onPaymentSuccess) {
        onPaymentSuccess(receipt);
      }
    }, 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="card max-w-lg w-full p-6 sm:p-8 bg-dark-900 border border-dark-700 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                💳
              </span>
              <div>
                <h2 className="text-lg font-display font-bold text-white">MessPay Checkout Gateway</h2>
                <p className="text-xs text-dark-400">256-Bit Bank Level Encryption</p>
              </div>
            </div>
            <button onClick={onClose} className="text-dark-400 hover:text-white p-1">
              <FiX size={20} />
            </button>
          </div>

          {/* Amount Header Card */}
          {step !== 'SUCCESS' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-dark-800 border border-emerald-500/30 flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Total Mess Bill</p>
                <p className="text-sm text-dark-300">{summary.monthName} {summary.year} • {summary.chargeableDays} days</p>
              </div>
              <p className="text-2xl font-black text-emerald-400">₹{summary.totalPayable.toFixed(2)}</p>
            </div>
          )}

          {/* STEP 1 & 2: SELECT METHOD & DETAILS */}
          {(step === 'METHOD' || step === 'DETAILS') && (
            <div>
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => { setMethod('UPI'); setStep('DETAILS'); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    method === 'UPI'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white ring-2 ring-emerald-500/30'
                      : 'border-dark-800 bg-dark-950 text-dark-400 hover:border-dark-700'
                  }`}
                >
                  <FiSmartphone size={18} /> UPI / QR
                </button>

                <button
                  type="button"
                  onClick={() => { setMethod('CARD'); setStep('DETAILS'); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    method === 'CARD'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white ring-2 ring-emerald-500/30'
                      : 'border-dark-800 bg-dark-950 text-dark-400 hover:border-dark-700'
                  }`}
                >
                  <FiCreditCard size={18} /> Card
                </button>

                <button
                  type="button"
                  onClick={() => { setMethod('NETBANKING'); setStep('DETAILS'); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    method === 'NETBANKING'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white ring-2 ring-emerald-500/30'
                      : 'border-dark-800 bg-dark-950 text-dark-400 hover:border-dark-700'
                  }`}
                >
                  <FiGlobe size={18} /> NetBanking
                </button>
              </div>

              {/* METHOD 1: UPI */}
              {method === 'UPI' && (
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 text-center">
                    <p className="text-xs text-dark-400 mb-2">Scan QR Code to Pay via Any UPI App</p>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=northmess@upi%26pn=NorthHostelMess%26am=${summary.totalPayable}%26cu=INR`}
                        alt="UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-2">UPI ID: northmess@upi</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1">Or Enter Your VPA / UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210@paytm or name@okicici"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input-field py-2.5 text-sm bg-dark-950 border-dark-800 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600 border-none text-white py-3 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    Pay ₹{summary.totalPayable.toFixed(2)} via UPI <FiArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* METHOD 2: CREDIT / DEBIT CARD */}
              {method === 'CARD' && (
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-dark-300">Card Number</label>
                      <span className="text-xs text-emerald-400 font-bold">{detectCardBrand(cardNumber).logo}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8921"
                      value={cardNumber}
                      onChange={(e) => handleFormatCardNumber(e.target.value)}
                      className="input-field py-2.5 text-sm bg-dark-950 border-dark-800 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="08/28"
                        value={cardExpiry}
                        onChange={(e) => handleFormatExpiry(e.target.value)}
                        className="input-field py-2.5 text-sm bg-dark-950 border-dark-800 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="input-field py-2.5 text-sm bg-dark-950 border-dark-800 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input-field py-2.5 text-sm bg-dark-950 border-dark-800 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600 border-none text-white py-3 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    Pay ₹{summary.totalPayable.toFixed(2)} via Card <FiArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* METHOD 3: NETBANKING */}
              {method === 'NETBANKING' && (
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-2">Select Your Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                            selectedBank === bank
                              ? 'border-emerald-500 bg-emerald-500/20 text-white'
                              : 'border-dark-800 bg-dark-950 text-dark-400 hover:border-dark-700'
                          }`}
                        >
                          🏦 {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600 border-none text-white py-3 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                  >
                    Proceed to {selectedBank} NetBanking <FiArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: 3D SECURE OTP VERIFICATION */}
          {step === 'OTP' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mx-auto mb-2">
                <FiLock />
              </div>
              <h3 className="text-lg font-bold text-white">Bank 3D-Secure 2FA</h3>
              <p className="text-xs text-dark-400">
                Enter the 6-digit OTP sent to your registered mobile number <strong className="text-white">+91 ******4321</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="1 2 3 4 5 6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field text-center text-xl font-mono tracking-widest py-3 bg-dark-950 border-emerald-500/50 text-emerald-400"
                  autoFocus
                />

                <p className="text-[11px] text-amber-400">💡 Demo Hint: Enter <strong>123456</strong> to authorize payment</p>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep('DETAILS')} className="btn-secondary w-1/3 py-2.5 text-xs">
                    Back
                  </button>
                  <button type="submit" className="btn-primary w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 text-xs">
                    Authorize Payment ₹{summary.totalPayable.toFixed(2)}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: PROCESSING SPINNER */}
          {step === 'PROCESSING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto"></div>
              <h3 className="text-lg font-bold text-white">Processing Payment...</h3>
              <p className="text-xs text-dark-400 flex items-center justify-center gap-1">
                <FiShield className="text-emerald-400" /> Communicating with bank server securely
              </p>
            </motion.div>
          )}

          {/* STEP 5: PAYMENT SUCCESS & RECEIPT */}
          {step === 'SUCCESS' && receiptData && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                <FiCheck />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Payment Successful
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">₹{receiptData.amount.toFixed(2)} Paid</h3>
                <p className="text-xs text-dark-400">Transaction ID: <span className="text-white font-mono">{receiptData.transactionId}</span></p>
              </div>

              {/* Digital Receipt Card */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-dark-800 pb-2">
                  <span className="text-dark-400">Statement Period:</span>
                  <span className="font-bold text-white">{receiptData.monthName} {receiptData.year}</span>
                </div>
                <div className="flex justify-between border-b border-dark-800 pb-2">
                  <span className="text-dark-400">Payment Method:</span>
                  <span className="font-bold text-emerald-400">{receiptData.method}</span>
                </div>
                <div className="flex justify-between border-b border-dark-800 pb-2">
                  <span className="text-dark-400">Paid Date & Time:</span>
                  <span className="font-bold text-white">{receiptData.paidAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Chargeable Days:</span>
                  <span className="font-bold text-white">{receiptData.chargeableDays} days @ ₹{receiptData.dailyRate}/day</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="btn-secondary w-1/2 py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <FiDownload size={14} /> Download Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

          {/* Secure Footer */}
          <div className="mt-6 pt-4 border-t border-dark-800 text-center text-[11px] text-dark-500 flex items-center justify-center gap-1.5">
            <FiShield size={12} className="text-emerald-500" /> Protected by MessPay Gateway 256-Bit SSL Encryption
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
