import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiMessageSquare, FiAlertCircle,
  FiUserCheck, FiBarChart2, FiArrowRight, FiSettings, FiRefreshCw, FiBell, FiCheckSquare, FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await reportService.getSummary();
      setSummary(response.data || {});
    } catch (summaryError) {
      const message = summaryError.response?.data?.message || 'Failed to load dashboard summary';
      setError(message);
      setSummary(null);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const stats = [
    { label: 'Total Students', value: summary?.totalStudents ?? 0, icon: <FiUsers />, color: 'from-blue-500 to-indigo-500', change: 'Live count' },
    { label: 'Pending Approvals', value: summary?.pendingStudents ?? 0, icon: <FiUserCheck />, color: 'from-amber-500 to-orange-500', change: 'Awaiting review' },
    { label: 'Weekly Feedback', value: summary?.totalFeedback ?? 0, icon: <FiMessageSquare />, color: 'from-primary-500 to-emerald-500', change: 'Submitted feedback' },
    { label: 'Open Complaints', value: summary?.pendingComplaints ?? 0, icon: <FiAlertCircle />, color: 'from-rose-500 to-red-500', change: 'Pending action' },
  ];

  const quickActions = [
    { to: '/admin/students', icon: <FiUsers size={22} />, label: 'Manage Students', desc: 'Approve, view, manage registrations', color: 'bg-blue-500' },
    { to: '/admin/polls', icon: <FiCheckSquare size={22} />, label: 'Student Polls', desc: 'Create queries, track live votes & store results', color: 'bg-indigo-500' },
    { to: '/admin/menu', icon: <FiCalendar size={22} />, label: 'Update Menu', desc: 'Daily and weekly menu management', color: 'bg-primary-500' },
    { to: '/admin/feedback', icon: <FiBarChart2 size={22} />, label: 'View Feedback', desc: 'Analytics and student feedback', color: 'bg-purple-500' },
    { to: '/admin/complaints', icon: <FiAlertCircle size={22} />, label: 'Complaints', desc: 'Resolve student complaints', color: 'bg-rose-500' },
    { to: '/admin/announcements', icon: <FiBell size={22} />, label: 'Announcements', desc: 'Post notices and updates', color: 'bg-amber-500' },
    { to: '/admin/staff', icon: <FiSettings size={22} />, label: 'Manage Staff', desc: 'Staff details and roles', color: 'bg-teal-500' },
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-800 via-dark-900 to-dark-950 p-6 md:p-10 border border-dark-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl flex-shrink-0">
                <span className="text-white font-display font-bold text-2xl">A</span>
              </div>
              <div>
                <p className="text-dark-400 text-sm font-medium mb-1">Admin Panel</p>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                  Welcome, {user?.name || 'Mess Secretary'}
                </h1>
                <p className="text-dark-400 mt-1 text-sm md:text-base">North Mess Management System</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {loading ? (
            <div className="col-span-full card p-10">
              <Loader size="lg" />
              <p className="text-center text-dark-500 dark:text-dark-400 mt-4">Loading dashboard summary...</p>
            </div>
          ) : error ? (
            <div className="col-span-full card p-10 text-center">
              <span className="text-4xl mb-4 block">⚠️</span>
              <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">Dashboard summary unavailable</h3>
              <p className="text-dark-500 dark:text-dark-400 mb-4">{error}</p>
              <button
                onClick={fetchSummary}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                <FiRefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : (
            stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i + 1} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-3xl font-display font-bold text-dark-900 dark:text-white">{stat.value}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{stat.label}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">{stat.change}</p>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mb-6">
          <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-5">Quick Actions</h2>
        </motion.div>
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action, index) => (
            <motion.div key={action.label} variants={fadeUp} custom={index + 6}>
              <Link to={action.to} className="card p-6 flex items-start gap-4 group">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{action.desc}</p>
                </div>
                <FiArrowRight className="text-dark-300 dark:text-dark-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
