import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCreditCard, FiUsers, FiCheckCircle, FiXCircle, FiClock,
  FiFileText, FiSettings, FiCheck, FiRefreshCw, FiDollarSign
} from 'react-icons/fi';
import { billingService } from '../services/billingService';
import { studentService } from '../services/studentService';
import { dataStorage } from '../utils/dataStorage';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminBilling() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'leaves' | 'config'

  const [students, setStudents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [config, setConfig] = useState({ defaultMonthlyFee: 3600 });
  const [loading, setLoading] = useState(true);

  // Fee Config state
  const [baseFeeInput, setBaseFeeInput] = useState(3600);
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchAdminBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, leavesRes, configRes] = await Promise.all([
        studentService.getAll(),
        billingService.getLeaveRequests(),
        billingService.getBillingConfig(),
      ]);

      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setLeaveRequests(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      const cfg = configRes.data || { defaultMonthlyFee: 3600 };
      setConfig(cfg);
      setBaseFeeInput(cfg.defaultMonthlyFee || 3600);
    } catch (err) {
      console.error('Failed to load admin billing data:', err);
      toast.error('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminBillingData();
    const handleUpdate = () => fetchAdminBillingData();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchAdminBillingData]);

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await billingService.updateLeaveStatus(leaveId, status);
      toast.success(`Leave request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
      fetchAdminBillingData();
    } catch (err) {
      toast.error('Failed to update leave status');
    }
  };

  const handleVerifyPayment = async (recordId) => {
    try {
      await billingService.verifyPayment(recordId, 'PAID');
      toast.success('Student payment verified & marked as PAID!');
      fetchAdminBillingData();
    } catch (err) {
      toast.error('Failed to verify payment');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await billingService.updateBillingConfig({ defaultMonthlyFee: Number(baseFeeInput) });
      toast.success('Default monthly fee updated successfully!');
      fetchAdminBillingData();
    } catch (err) {
      toast.error('Failed to update billing config');
    } finally {
      setSavingConfig(false);
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

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-3">
                <FiCreditCard size={14} /> Admin Mess Billing & Leave Panel
              </span>
              <h1 className="section-title text-left">Mess Fee Calculation & Leave Approvals</h1>
              <p className="section-subtitle text-left mt-1">
                Approve student leave requests, review daily rates, and manage monthly mess bills.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-100 dark:border-dark-800 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <FiUsers size={16} /> Student Billing Roster
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 relative ${
              activeTab === 'leaves'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <FiClock size={16} /> Leave Approvals
            {pendingLeavesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {pendingLeavesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <FiSettings size={16} /> Fee Configuration
          </button>
        </div>

        {loading ? (
          <div className="card p-10 text-center text-dark-500">Loading admin billing data...</div>
        ) : (
          <div>
            {/* ─── TAB 1: STUDENT BILLING ROSTER ─── */}
            {activeTab === 'roster' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white">
                      All-Student Mess Fee Roster
                    </h2>
                    <p className="text-xs text-dark-400">Auto-calculated based on approved leave days</p>
                  </div>
                  <span className="badge-primary bg-emerald-600 text-white border-none">
                    Base Fee: ₹{config.defaultMonthlyFee || 3600}/month
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-dark-100 dark:border-dark-800">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-dark-50 dark:bg-dark-800/50 text-dark-700 dark:text-dark-300 font-semibold border-b border-dark-100 dark:border-dark-800">
                        <th className="p-4">Student</th>
                        <th className="p-4 text-center">Base Fee</th>
                        <th className="p-4 text-center">Daily Rate</th>
                        <th className="p-4 text-center">Present</th>
                        <th className="p-4 text-center">Approved Leave</th>
                        <th className="p-4 text-center">Chargeable</th>
                        <th className="p-4 text-right">Final Bill</th>
                        <th className="p-4 text-center">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                      {students.map((student) => {
                        const billingSummary = dataStorage.getStudentBillingSummary(student, selectedMonth, selectedYear);

                        return (
                          <tr key={student.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-dark-900 dark:text-white">{student.name}</p>
                              <p className="text-xs text-dark-400">{student.rollNumber || 'N/A'} • {student.department}</p>
                            </td>
                            <td className="p-4 text-center font-medium">₹{billingSummary.baseMonthlyFee}</td>
                            <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">₹{billingSummary.dailyRate}</td>
                            <td className="p-4 text-center font-bold text-emerald-600">{billingSummary.presentDays} d</td>
                            <td className="p-4 text-center font-bold text-rose-500">{billingSummary.approvedLeaveDays} d</td>
                            <td className="p-4 text-center font-bold">{billingSummary.chargeableDays} d</td>
                            <td className="p-4 text-right font-extrabold text-dark-900 dark:text-white text-base">
                              ₹{billingSummary.totalPayable.toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                              {billingSummary.paymentStatus === 'PAID' ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    ✓ PAID ONLINE
                                  </span>
                                  {billingSummary.transactionRef && (
                                    <span className="text-[10px] text-dark-500 font-mono">
                                      Txn: {billingSummary.transactionRef}
                                    </span>
                                  )}
                                </div>
                              ) : billingSummary.paymentStatus === 'PENDING_VERIFICATION' ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                    Ref: {billingSummary.transactionRef || 'Submitted'}
                                  </span>
                                  <button
                                    onClick={() => handleVerifyPayment(billingSummary.recordId)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
                                  >
                                    Verify Payment
                                  </button>
                                </div>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400">
                                  UNPAID
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 2: LEAVE APPROVALS ─── */}
            {activeTab === 'leaves' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card p-6">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-4">
                  Student Mess Leave Applications ({leaveRequests.length})
                </h2>

                {leaveRequests.length === 0 ? (
                  <div className="p-8 text-center text-dark-400">No student leave requests.</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-dark-100 dark:border-dark-800">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-dark-50 dark:bg-dark-800/50 text-dark-700 dark:text-dark-300 font-semibold border-b border-dark-100 dark:border-dark-800">
                          <th className="p-4">Student</th>
                          <th className="p-4">Dates</th>
                          <th className="p-4 text-center">Duration</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                        {leaveRequests.map((leave) => (
                          <tr key={leave.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30">
                            <td className="p-4">
                              <p className="font-bold text-dark-900 dark:text-white">{leave.studentName}</p>
                              <p className="text-xs text-dark-400">{leave.rollNumber || leave.studentEmail}</p>
                            </td>
                            <td className="p-4 text-xs font-semibold text-dark-700 dark:text-dark-300">
                              {leave.startDate} to {leave.endDate}
                            </td>
                            <td className="p-4 text-center font-bold text-rose-500">
                              {leave.daysCount} Days
                            </td>
                            <td className="p-4 text-xs text-dark-600 dark:text-dark-400">{leave.reason || 'Leave'}</td>
                            <td className="p-4 text-center">
                              {leave.status === 'APPROVED' ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                  Approved
                                </span>
                              ) : leave.status === 'REJECTED' ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                  Rejected
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {leave.status === 'PENDING' && (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleLeaveAction(leave.id, 'APPROVED')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1"
                                  >
                                    <FiCheck size={14} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleLeaveAction(leave.id, 'REJECTED')}
                                    className="px-3 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs font-semibold flex items-center gap-1"
                                  >
                                    <FiXCircle size={14} /> Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── TAB 3: FEE CONFIGURATION ─── */}
            {activeTab === 'config' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card p-6 max-w-xl">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-2">
                  Mess Fee Configuration
                </h2>
                <p className="text-sm text-dark-500 mb-6">Set the base monthly mess fee used in the absence deduction formula.</p>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Default Monthly Base Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={baseFeeInput}
                      onChange={(e) => setBaseFeeInput(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800 text-sm text-dark-600 dark:text-dark-400 space-y-2">
                    <p className="font-semibold text-dark-900 dark:text-white">📐 Deduction Formula</p>
                    <p className="font-mono text-base text-emerald-600 dark:text-emerald-400">
                      Payable = ₹{baseFeeInput} − (n − 1) × ₹80
                    </p>
                    <p className="text-xs text-dark-400">where <strong>n</strong> = approved absent days</p>
                    <table className="w-full text-xs mt-2 border-collapse">
                      <thead>
                        <tr className="text-left text-dark-400">
                          <th className="py-1 pr-4">Absent Days (n)</th>
                          <th className="py-1 pr-4">Deduction</th>
                          <th className="py-1">Payable</th>
                        </tr>
                      </thead>
                      <tbody className="text-dark-700 dark:text-dark-300">
                        {[0, 1, 2, 3, 5, 10].map((n) => {
                          const ded = n > 0 ? (n - 1) * 80 : 0;
                          const pay = Math.max(0, Number(baseFeeInput) - ded);
                          return (
                            <tr key={n} className="border-t border-dark-100 dark:border-dark-700">
                              <td className="py-1 pr-4">{n} day{n !== 1 ? 's' : ''}</td>
                              <td className="py-1 pr-4 text-rose-500">−₹{ded}</td>
                              <td className="py-1 font-bold text-emerald-600 dark:text-emerald-400">₹{pay}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button type="submit" disabled={savingConfig} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white">
                    {savingConfig ? 'Saving...' : 'Save Configuration'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
