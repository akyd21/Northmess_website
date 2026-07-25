import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiSend, FiMessageSquare, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { feedbackService } from '../services/feedbackService';
import { FEEDBACK_CATEGORIES } from '../utils/constants';
import { formatDate, calculateAverageRating } from '../utils/helpers';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Feedback() {
  const { user, isAdmin } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [analytics, setAnalytics] = useState({ totalFeedback: 0, avgRating: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState({});
  const [activeTab, setActiveTab] = useState('submit');
  const { register, handleSubmit, reset } = useForm();

  const fetchFeedback = useCallback(async () => {
    try {
      const res = isAdmin ? await feedbackService.getAll() : await feedbackService.getMy();
      const records = Array.isArray(res.data) ? res.data : [];
      setFeedbackList(records);

      if (isAdmin) {
        const analyticsRes = await feedbackService.getAnalytics();
        setAnalytics(analyticsRes.data || {});
      }
    } catch {
      toast.error('Failed to load feedback');
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchFeedback();

    const handleUpdate = () => fetchFeedback();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchFeedback]);

  const handleRatingChange = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (data) => {
    const missingRatings = FEEDBACK_CATEGORIES.filter((cat) => !ratings[cat.key]);
    if (missingRatings.length > 0) {
      toast.error('Please rate all categories');
      return;
    }

    setLoading(true);
    try {
      await feedbackService.submit({
        ...ratings,
        comments: data.comments,
        studentName: user?.name || 'Student',
        rollNumber: user?.rollNumber || '',
      });
      toast.success('Feedback submitted successfully! Thank you! 🎉');
      setSubmitted(true);
      reset();
      setRatings({});
      fetchFeedback();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiMessageSquare size={14} />
            {isAdmin ? 'Feedback Management' : 'Weekly Feedback'}
          </span>
          <h1 className="section-title">
            {isAdmin ? 'Student Feedback' : 'Rate Your Meals'}
          </h1>
          <p className="section-subtitle mt-4">
            {isAdmin
              ? 'View all student feedback and ratings'
              : 'Help us improve by sharing your weekly dining experience'
            }
          </p>
        </motion.div>

        {/* Tabs */}
        {!isAdmin && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex justify-center gap-2 mb-10">
            <button
              onClick={() => { setActiveTab('submit'); setSubmitted(false); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'submit'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              My History ({feedbackList.length})
            </button>
          </motion.div>
        )}

        {/* Submit Form */}
        {activeTab === 'submit' && !isAdmin && (
          <>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center"
              >
                <div className="card p-8 sm:p-12">
                  <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="text-primary-500" size={40} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white mb-3">
                    Thank You! 🎉
                  </h2>
                  <p className="text-dark-500 dark:text-dark-400 mb-8">
                    Your feedback has been submitted successfully. We value your input and will use it to improve our service.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary"
                  >
                    Submit Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="max-w-2xl mx-auto"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-xl">📝</span>
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-dark-900 dark:text-white">
                        Weekly Rating
                      </h2>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        Rate each category from 1 to 5 stars
                      </p>
                    </div>
                  </div>

                  {/* Rating Categories */}
                  <div className="space-y-4 mb-8">
                    {FEEDBACK_CATEGORIES.map((category) => (
                      <div
                        key={category.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.emoji}</span>
                          <span className="font-medium text-dark-700 dark:text-dark-300">
                            {category.label}
                          </span>
                        </div>
                        <StarRating
                          value={ratings[category.key] || 0}
                          onChange={(val) => handleRatingChange(category.key, val)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Comments */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      💬 Comments & Suggestions (Optional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share any specific feedback, suggestions, or compliments..."
                      className="input-field resize-none"
                      {...register('comments')}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 !py-3.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiSend size={18} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </>
        )}

        {/* History Tab / Admin View */}
        {(activeTab === 'history' || isAdmin) && (
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6">
            {isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Feedback', value: analytics.totalFeedback || feedbackList.length, icon: '📊' },
                  { label: 'Avg Rating', value: `${analytics.avgRating || 4.2} ★`, icon: '⭐' },
                  { label: 'Recent Submissions', value: feedbackList.length, icon: '📅' },
                ].map((stat) => (
                  <div key={stat.label} className="card p-5 text-center">
                    <span className="text-2xl mb-2 block">{stat.icon}</span>
                    <p className="text-2xl font-display font-bold text-dark-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {feedbackList.length === 0 ? (
              <div className="card p-12 text-center">
                <span className="text-4xl mb-4 block">💬</span>
                <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
                  No feedback found
                </h3>
                <p className="text-dark-500 dark:text-dark-400">
                  {isAdmin ? 'No students have submitted feedback yet.' : 'You have not submitted any feedback yet.'}
                </p>
              </div>
            ) : (
              feedbackList.map((fb, index) => (
                <motion.div key={fb.id || index} variants={fadeUp} custom={index} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <FiClock className="text-primary-500" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white">
                          {fb.week || 'Weekly Feedback'}
                          {fb.studentName ? ` • ${fb.studentName}` : ''}
                        </h3>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{formatDate(fb.createdAt)}</p>
                      </div>
                    </div>
                    <div className="badge-success">
                      Avg: {calculateAverageRating(fb)} ★
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-2 text-sm">
                        <span>{cat.emoji}</span>
                        <span className="text-dark-500 dark:text-dark-400">{cat.label}:</span>
                        <span className="font-semibold text-dark-900 dark:text-white">{fb[cat.key] || 0}★</span>
                      </div>
                    ))}
                  </div>

                  {fb.comments && (
                    <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                      <p className="text-sm text-dark-600 dark:text-dark-400 italic">"{fb.comments}"</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
