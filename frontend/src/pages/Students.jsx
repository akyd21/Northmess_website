import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiSearch, FiFilter, FiCheckCircle, FiXCircle,
  FiChevronDown, FiMail, FiPhone, FiHash, FiHome, FiRefreshCw,
  FiCamera, FiCreditCard, FiTrash2,
} from 'react-icons/fi';
import { DEPARTMENTS, YEARS } from '../utils/constants';
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers';
import { studentService } from '../services/studentService';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '');

function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const statusConfig = {
  APPROVED: { color: 'badge-success', label: 'Approved' },
  PENDING: { color: 'badge-warning', label: 'Pending' },
  REJECTED: { color: 'badge-danger', label: 'Rejected' },
};

const statusPriority = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
};

const normalizeStudent = (student) => ({
  ...student,
  id: student.id || student._id,
  status: (student.status || 'PENDING').toUpperCase(),
  department: student.department || '-',
  year: student.year || '-',
  hostelRoom: student.hostelRoom || '-',
});

const formatRegisteredDate = (dateString) => {
  if (!dateString) return 'Unknown';

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return 'Unknown';

  return formatDate(dateString);
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await studentService.getAll();
      const records = Array.isArray(response.data) ? response.data : [];
      const normalized = records
        .map(normalizeStudent)
        .sort((left, right) => {
          const priorityDiff = (statusPriority[left.status] ?? 99) - (statusPriority[right.status] ?? 99);
          if (priorityDiff !== 0) return priorityDiff;

          return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
        });

      setStudents(normalized);
    } catch (fetchError) {
      const message = fetchError.response?.data?.message || 'Failed to load student registrations';
      setError(message);
      setStudents([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesSearch = search === '' ||
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'All' || student.department === filterDept;
    const matchesYear = filterYear === 'All' || student.year === filterYear;
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesDept && matchesYear && matchesStatus;
  }), [filterDept, filterStatus, filterYear, search, students]);

  const pendingCount = useMemo(() => students.filter((student) => student.status === 'PENDING').length, [students]);
  const approvedCount = useMemo(() => students.filter((student) => student.status === 'APPROVED').length, [students]);

  const updateStudentStatus = async (id, action) => {
    setActionLoadingId(id);

    try {
      if (action === 'approve') {
        await studentService.approve(id);
        toast.success('Student approved successfully');
      } else {
        await studentService.reject(id);
        toast.success('Student registration rejected');
      }

      await fetchStudents();
    } catch (statusError) {
      const message = statusError.response?.data?.message || `Failed to ${action} student`;
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = (id) => updateStudentStatus(id, 'approve');

  const handleReject = (id) => updateStudentStatus(id, 'reject');

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the mess? They will receive an email notification.`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      await studentService.delete(id);
      toast.success('Student removed successfully');
      await fetchStudents();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove student';
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiUsers size={14} />
            Student Management
          </span>
          <h1 className="section-title">Manage Students</h1>
          <p className="section-subtitle mt-4">
            View, approve, and manage student registrations
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Students', value: approvedCount, emoji: '👥', color: 'text-blue-500' },
            { label: 'Approved', value: approvedCount, emoji: '✅', color: 'text-green-500' },
            { label: 'Pending Approval', value: pendingCount, emoji: '⏳', color: 'text-amber-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i + 1} className="card p-5 text-center">
              <span className="text-2xl mb-2 block">{stat.emoji}</span>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mb-8">
          <div className="card p-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, roll number, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-11"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="input-field !w-auto text-sm"
                >
                  <option value="All">All Depts</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="input-field !w-auto text-sm"
                >
                  <option value="All">All Years</option>
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field !w-auto text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={fetchStudents}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-200 dark:border-dark-700 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                >
                  <FiRefreshCw size={14} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mb-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">
            <FiFilter className="inline mr-1" size={14} />
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </motion.div>

        {/* Students List */}
        <motion.div initial="hidden" animate="visible" className="space-y-3">
          {loading ? (
            <div className="card p-12">
              <Loader size="lg" />
              <p className="text-center text-dark-500 dark:text-dark-400 mt-4">Loading student registrations...</p>
            </div>
          ) : error ? (
            <div className="card p-12 text-center">
              <span className="text-4xl mb-4 block">⚠️</span>
              <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
                Could not load students
              </h3>
              <p className="text-dark-500 dark:text-dark-400 mb-6">{error}</p>
              <button
                onClick={fetchStudents}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                <FiRefreshCw size={14} />
                Try Again
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
                No students found
              </h3>
              <p className="text-dark-500 dark:text-dark-400">
                {students.length === 0
                  ? 'No registrations have been submitted yet.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student, index) => {
              const status = statusConfig[student.status];
              const isExpanded = expandedId === student.id;
              const initials = getInitials(student.name);
              const avatarColor = getAvatarColor(student.name);

              return (
                <motion.div
                  key={student.id}
                  variants={fadeUp}
                  custom={index + 6}
                  className={`card overflow-hidden ${student.status === 'PENDING' ? 'ring-2 ring-amber-300 dark:ring-amber-700' : ''}`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                    className="w-full p-5 text-left flex items-center gap-4"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0 overflow-hidden`}>
                      {buildImageUrl(student.photoUrl)
                        ? <img src={buildImageUrl(student.photoUrl)} alt={student.name} className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-dark-900 dark:text-white">
                          {student.name}
                        </h3>
                        <span className={status.color}>{status.label}</span>
                      </div>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
                        {student.rollNumber} • {student.department} • {student.year}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="hidden sm:flex items-center gap-2">
                      {student.status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(student.id); }}
                            disabled={actionLoadingId === student.id}
                            className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title="Approve"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(student.id); }}
                            disabled={actionLoadingId === student.id}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Reject"
                          >
                            <FiXCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(student.id, student.name); }}
                        disabled={actionLoadingId === student.id}
                        className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                        title="Delete Student"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <FiChevronDown
                      className={`text-dark-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-dark-100 dark:border-dark-800 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <FiMail className="text-primary-500 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-xs text-dark-400">Email</p>
                            <p className="text-dark-700 dark:text-dark-300">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <FiPhone className="text-primary-500 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-xs text-dark-400">Phone</p>
                            <p className="text-dark-700 dark:text-dark-300">{student.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <FiHash className="text-primary-500 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-xs text-dark-400">Roll Number</p>
                            <p className="text-dark-700 dark:text-dark-300">{student.rollNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <FiHome className="text-primary-500 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-xs text-dark-400">Hostel Room</p>
                            <p className="text-dark-700 dark:text-dark-300">{student.hostelRoom}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      {(student.photoUrl || student.idCardUrl) && (
                        <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800">
                          <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 mb-3">Documents</p>
                          <div className="flex flex-wrap gap-4">
                            {student.photoUrl && (
                              <div>
                                <p className="text-xs text-dark-400 mb-1 flex items-center gap-1"><FiCamera size={11} /> Passport Photo</p>
                                <a href={`${API_ORIGIN}${student.photoUrl}`} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={`${API_ORIGIN}${student.photoUrl}`}
                                    alt="Passport Photo"
                                    className="w-20 h-20 rounded-xl object-cover border-2 border-primary-200 dark:border-primary-700 hover:opacity-80 transition-opacity shadow cursor-pointer"
                                    title="Click to view full size"
                                  />
                                </a>
                              </div>
                            )}
                            {student.idCardUrl && (
                              <div>
                                <p className="text-xs text-dark-400 mb-1 flex items-center gap-1"><FiCreditCard size={11} /> College ID Card</p>
                                <a href={`${API_ORIGIN}${student.idCardUrl}`} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={`${API_ORIGIN}${student.idCardUrl}`}
                                    alt="College ID Card"
                                    className="h-20 w-auto max-w-[140px] rounded-xl object-cover border-2 border-primary-200 dark:border-primary-700 hover:opacity-80 transition-opacity shadow cursor-pointer"
                                    title="Click to view full size"
                                  />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-dark-400 mt-4">
                        Registered: {formatRegisteredDate(student.createdAt)}
                      </p>

                      {/* Mobile Actions */}
                      <div className="flex flex-col gap-3 mt-4 sm:hidden">
                        {student.status === 'PENDING' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(student.id)}
                              disabled={actionLoadingId === student.id}
                              className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <FiCheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(student.id)}
                              disabled={actionLoadingId === student.id}
                              className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <FiXCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          disabled={actionLoadingId === student.id}
                          className="w-full px-4 py-2 rounded-xl bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiTrash2 size={14} /> Remove Student
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
