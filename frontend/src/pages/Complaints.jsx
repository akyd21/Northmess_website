import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertCircle, FiSend, FiCheckCircle, FiClock,
  FiXCircle, FiFilter, FiPlus, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { COMPLAINT_CATEGORIES } from '../utils/constants';
import { formatDateTime, capitalize } from '../utils/helpers';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const statusConfig = {
  PENDING: { color: 'badge-warning', icon: <FiClock size={14} />, label: 'Pending' },
  RESOLVED: { color: 'badge-success', icon: <FiCheckCircle size={14} />, label: 'Resolved' },
  REJECTED: { color: 'badge-danger', icon: <FiXCircle size={14} />, label: 'Rejected' },
};

export default function Complaints() {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [adminResponseInput, setAdminResponseInput] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const fetchComplaints = useCallback(async () => {
    try {
      const res = isAdmin ? await complaintService.getAll() : await complaintService.getMy();
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load complaints');
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchComplaints();

    const handleUpdate = () => fetchComplaints();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchComplaints]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await complaintService.submit({
        ...data,
        submittedBy: user?.name || 'Student',
        rollNumber: user?.rollNumber || '',
      });
      toast.success('Complaint submitted successfully!');
      reset();
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = filter === 'ALL'
    ? complaints
    : complaints.filter((c) => c.status === filter);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await complaintService.updateStatus(id, newStatus, adminResponseInput);
      toast.success(`Complaint ${newStatus.toLowerCase()} successfully`);
      setAdminResponseInput('');
      fetchComplaints();
    } catch {
      toast.error('Failed to update complaint status');
    }
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiAlertCircle size={14} />
            {isAdmin ? 'Complaint Management' : 'Complaints'}
          </span>
          <h1 className="section-title">
            {isAdmin ? 'Manage Complaints' : 'Submit a Complaint'}
          </h1>
          <p className="section-subtitle mt-4">
            {isAdmin
              ? 'Review and resolve student complaints'
              : 'Let us know about any issues and we\'ll address them promptly'
            }
          </p>
        </motion.div>

        {/* New Complaint Button & Filters */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          {!isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FiPlus size={18} />
              {showForm ? 'Cancel' : 'New Complaint'}
            </button>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter className="text-dark-400" size={16} />
            {['ALL', 'PENDING', 'RESOLVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === status
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                }`}
              >
                {capitalize(status)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* New Complaint Form */}
        <AnimatePresence>
          {showForm && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 max-w-2xl mx-auto">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-6">
                  📝 New Complaint
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Category
                    </label>
                    <select
                      className="input-field"
                      {...register('category', { required: 'Please select a category' })}
                    >
                      <option value="">Select category</option>
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Brief title for your complaint"
                      className="input-field"
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the issue in detail..."
                      className="input-field resize-none"
                      {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 10, message: 'Please provide more details' }
                      })}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 !py-3.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiSend size={16} />
                        Submit Complaint
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Stats */}
        {isAdmin && (
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Complaints', value: totalCount, emoji: '📋', color: 'text-blue-500' },
              { label: 'Pending', value: pendingCount, emoji: '⏳', color: 'text-amber-500' },
              { label: 'Resolved', value: resolvedCount, emoji: '✅', color: 'text-green-500' },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i} className="card p-5 text-center">
                <span className="text-2xl mb-2 block">{stat.emoji}</span>
                <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Complaints List */}
        <motion.div initial="hidden" animate="visible" className="space-y-4 max-w-3xl mx-auto">
          {filteredComplaints.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-4xl mb-4 block">🎉</span>
              <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
                No complaints found
              </h3>
              <p className="text-dark-500 dark:text-dark-400">
                {filter !== 'ALL' ? `No ${filter.toLowerCase()} complaints.` : 'No complaints have been submitted yet.'}
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint, index) => {
              const status = statusConfig[complaint.status] || statusConfig.PENDING;
              const isExpanded = expandedId === complaint.id;

              return (
                <motion.div
                  key={complaint.id}
                  variants={fadeUp}
                  custom={index + 2}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      complaint.category === 'Food' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                      complaint.category === 'Water' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                      complaint.category === 'Cleanliness' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' :
                      complaint.category === 'Staff Behaviour' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                      'bg-dark-100 dark:bg-dark-800 text-dark-600'
                    }`}>
                      {complaint.category === 'Food' ? '🍽️' :
                       complaint.category === 'Water' ? '💧' :
                       complaint.category === 'Cleanliness' ? '🧹' :
                       complaint.category === 'Staff Behaviour' ? '👥' : '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-dark-900 dark:text-white">
                          {complaint.title}
                        </h3>
                        <span className={status.color}>
                          <span className="flex items-center gap-1">
                            {status.icon}
                            {status.label}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        {complaint.category} • {formatDateTime(complaint.createdAt)}
                        {complaint.submittedBy ? ` • ${complaint.submittedBy}` : ''}
                      </p>
                    </div>
                    <FiChevronDown
                      className={`text-dark-400 transition-transform flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 border-t border-dark-100 dark:border-dark-800 pt-4">
                          <p className="text-dark-600 dark:text-dark-400 mb-4 whitespace-pre-line">
                            {complaint.description}
                          </p>

                          {complaint.adminResponse && (
                            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 mb-4">
                              <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">
                                Admin Response
                              </p>
                              <p className="text-sm text-primary-600 dark:text-primary-500">
                                {complaint.adminResponse}
                              </p>
                            </div>
                          )}

                          {isAdmin && complaint.status === 'PENDING' && (
                            <div className="space-y-3 mt-4 pt-4 border-t border-dark-100 dark:border-dark-800">
                              <input
                                type="text"
                                placeholder="Optional response note to student..."
                                value={adminResponseInput}
                                onChange={(e) => setAdminResponseInput(e.target.value)}
                                className="input-field text-sm"
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <FiCheckCircle size={14} /> Resolve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(complaint.id, 'REJECTED')}
                                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <FiXCircle size={14} /> Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
