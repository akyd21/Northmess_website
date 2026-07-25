import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiBell, FiCalendar, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/announcementService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const categoryColors = {
  'Menu Changes': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Holiday: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  General: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Hostel Notice': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

export default function Announcements() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const categories = ['All', 'Menu Changes', 'Holiday', 'General', 'Hostel Notice'];

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await announcementService.getAll();
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load announcements');
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();

    const handleUpdate = () => fetchAnnouncements();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchAnnouncements]);

  const filteredAnnouncements = selectedCategory === 'All'
    ? announcements
    : announcements.filter((a) => a.category === selectedCategory);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await announcementService.create(data);
      toast.success('Announcement posted successfully!');
      reset();
      setShowForm(false);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await announcementService.delete(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiBell size={14} />
            Notice Board
          </span>
          <h1 className="section-title">Announcements</h1>
          <p className="section-subtitle mt-4">
            Stay updated with the latest notices and information from North Mess
          </p>
        </motion.div>

        {/* Admin: Create Button */}
        {isAdmin && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex justify-center mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary inline-flex items-center gap-2"
            >
              {showForm ? <FiX size={18} /> : <FiPlus size={18} />}
              {showForm ? 'Cancel' : 'New Announcement'}
            </button>
          </motion.div>
        )}

        {/* Admin: Create Form */}
        {showForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8">
              <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-6">
                📢 Post New Announcement
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Announcement title"
                    className="input-field"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Category</label>
                    <select className="input-field" {...register('category', { required: 'Category is required' })}>
                      <option value="">Select category</option>
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Priority</label>
                    <select className="input-field" {...register('priority')}>
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Content</label>
                  <textarea
                    rows={4}
                    placeholder="Write the announcement content..."
                    className="input-field resize-none"
                    {...register('content', { required: 'Content is required' })}
                  />
                  {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Post Announcement</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Announcements List */}
        <div className="max-w-3xl mx-auto space-y-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
                No announcements
              </h3>
              <p className="text-dark-500 dark:text-dark-400">
                {isAdmin
                  ? 'Click "New Announcement" above to post the first notice.'
                  : 'No notices posted in this category yet.'}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={index + 3}
                className={`card overflow-hidden ${
                  announcement.priority === 'important' ? 'ring-2 ring-amber-400 dark:ring-amber-600' : ''
                }`}
              >
                {announcement.priority === 'important' && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 text-white text-xs font-semibold tracking-wide uppercase">
                    ⚠️ Important Notice
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-lg font-display font-bold text-dark-900 dark:text-white">
                      {announcement.title}
                    </h2>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 rounded-lg text-dark-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all flex-shrink-0"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className={`badge text-xs ${categoryColors[announcement.category] || categoryColors.General}`}>
                      {announcement.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-dark-400 dark:text-dark-500">
                      <FiCalendar size={12} />
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>

                  <p className="text-dark-600 dark:text-dark-400 leading-relaxed whitespace-pre-line">
                    {announcement.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
