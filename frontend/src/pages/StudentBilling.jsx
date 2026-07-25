import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiCreditCard, FiClock, FiCheckCircle, FiAlertCircle,
  FiX, FiSend, FiPlusCircle, FiFileText, FiInfo, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { billingService } from '../services/billingService';
import PaymentGatewayModal from '../components/billing/PaymentGatewayModal';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudentBilling() {
  const { user } = useAuth();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Leave Form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Payment Form
  const [transactionRef, setTransactionRef] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryRes = await billingService.getStudentBillingSummary(user, selectedMonth, selectedYear);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Failed to load billing data:', err);
      toast.error('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBillingData();
    const handleUpdate = () => fetchBillingData();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchBillingData]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates for your leave');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setSubmittingLeave(true);
    try {
      await billingService.applyLeaveRequest({
        studentId: user?.id,
        studentEmail: user?.email,
        studentName: user?.name || 'Student',
        rollNumber: user?.rollNumber || 'N/A',
        startDate,
        endDate,
        reason: leaveReason.trim() || 'Mess Leave Request',
      });

      toast.success('Leave request submitted! Waiting for Admin approval.');
      setIsLeaveModalOpen(false);
      setStartDate('');
      setEndDate('');
      setLeaveReason('');
      fetchBillingData();
    } catch (err) {
      toast.error('Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      toast.error('Please enter payment transaction reference ID (UPI / UTR)');
      return;
    }

    setSubmittingPayment(true);
    try {
      await billingService.submitPayment(user, selectedMonth, selectedYear, transactionRef.trim());
      toast.success('Payment details submitted! Awaiting Admin verification.');
      setIsPayModalOpen(false);
      setTransactionRef('');
      fetchBillingData();
    } catch (err) {
      toast.error('Failed to submit payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-3">
                <FiCreditCard size={14} /> Smart Mess Billing Engine
              </span>
              <h1 className="section-title text-left">Monthly Mess Fee & Daily Tracker</h1>
              <p className="section-subtitle text-left mt-1">
                Absent for <strong>n</strong> days? Pay: <strong>₹3600 − (n−1) × ₹80</strong>. First absent day has no deduction!
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="input-field py-2 text-sm w-36"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input-field py-2 text-sm w-28"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>
        </motion.div>

        {loading || !summary ? (
          <div className="card p-10 text-center text-dark-500">Loading mess billing calculator...</div>
        ) : (
          <div className="space-y-10">
            {/* ─── MESS FEE SUMMARY CARD ─── */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card p-6 md:p-8 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 text-white border border-dark-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-dark-800">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Mess Fee Summary</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1 text-white">
                    {summary.monthName} {summary.year} Statement
                  </h2>
                  <p className="text-sm text-dark-400 mt-1">
                    Student: <span className="text-white font-semibold">{user?.name}</span> ({user?.rollNumber || 'N/A'})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 backdrop-blur transition-all"
                  >
                    <FiPlusCircle size={16} /> Apply for Mess Leave
                  </button>

                  {summary.paymentStatus === 'PAID' ? (
                    <span className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-bold flex items-center gap-2">
                      <FiCheckCircle size={16} /> Paid & Verified
                    </span>
                  ) : summary.paymentStatus === 'PENDING_VERIFICATION' ? (
                    <span className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-bold flex items-center gap-2">
                      <FiClock size={16} /> Payment Pending Verification
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsPayModalOpen(true)}
                      className="btn-primary bg-emerald-500 hover:bg-emerald-600 border-none text-white text-sm font-bold px-6 py-2.5 shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                    >
                      <FiCreditCard size={16} /> Pay ₹{summary.totalPayable.toFixed(2)}
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Stats Grid — amount is set by Admin per month, not calculated on the frontend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[11px] text-dark-400 uppercase font-semibold">Monthly Fee (Set by Admin)</p>
                  <p className="text-lg font-bold text-white mt-1">₹{summary.baseMonthlyFee}</p>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400 text-white shadow-lg">
                  <p className="text-[11px] text-emerald-100 uppercase font-bold">Total Payable</p>
                  <p className="text-lg font-extrabold mt-1">₹{summary.totalPayable.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ─── APPLY LEAVE MODAL ─── */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card max-w-lg w-full p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-dark-100 dark:border-dark-800 mb-6">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
                  📝 Apply for Mess Leave
                </h2>
                <button onClick={() => setIsLeaveModalOpen(false)} className="text-dark-400 hover:text-dark-600">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Family function, home visit, exam, etc."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="input-field resize-none"
                  ></textarea>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                  ⚠️ Note: Leave starts in <strong>Pending</strong> status. Once approved by Mess Admin, those days are charged <strong>₹0</strong>!
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-800">
                  <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingLeave} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <FiSend size={16} /> {submittingLeave ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PAY MESS FEE GATEWAY MODAL ─── */}
      <PaymentGatewayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        summary={summary}
        onPaymentSuccess={async (receipt) => {
          await billingService.submitPayment(user, selectedMonth, selectedYear, receipt);
          fetchBillingData();
        }}
      />
    </div>
  );
}