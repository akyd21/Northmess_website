import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX, FiChevronLeft, FiChevronRight, FiGrid, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { galleryService } from '../services/galleryService';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const gradients = [
  'from-primary-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-pink-500',
  'from-rose-500 to-red-500',
  'from-teal-500 to-cyan-500',
];

export default function Gallery() {
  const { isAdmin } = useAuth();
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'Food',
    desc: '',
    emoji: '📸',
    imageUrl: '',
  });

  const categories = ['All', 'Food', 'Dining Hall', 'Kitchen', 'Events'];

  const fetchGallery = useCallback(async () => {
    try {
      const res = await galleryService.getAll();
      setGalleryItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load gallery');
    }
  }, []);

  useEffect(() => {
    fetchGallery();

    const handleUpdate = () => fetchGallery();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchGallery]);

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newItem.title) {
      toast.error('Title is required');
      return;
    }

    try {
      const gradient = gradients[Math.floor(Math.random() * gradients.length)];
      await galleryService.upload({ ...newItem, gradient });
      toast.success('Photo added to gallery!');
      setNewItem({ title: '', category: 'Food', desc: '', emoji: '📸', imageUrl: '' });
      setShowAddForm(false);
      fetchGallery();
    } catch {
      toast.error('Failed to add photo');
    }
  };

  const handleDeletePhoto = async (id, e) => {
    e.stopPropagation();
    try {
      await galleryService.delete(id);
      toast.success('Photo deleted');
      if (lightbox?.id === id) setLightbox(null);
      fetchGallery();
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  const openLightbox = (item) => setLightbox(item);
  const closeLightbox = () => setLightbox(null);

  const navigateLightbox = (direction) => {
    if (!lightbox) return;
    const currentIndex = filteredItems.findIndex((item) => item.id === lightbox.id);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = filteredItems.length - 1;
    if (nextIndex >= filteredItems.length) nextIndex = 0;
    setLightbox(filteredItems[nextIndex]);
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiImage size={14} />
            Photo Gallery
          </span>
          <h1 className="section-title">North Mess Gallery</h1>
          <p className="section-subtitle mt-4">
            A visual tour of our dining facility, kitchen, food, and events
          </p>
        </motion.div>

        {/* Admin Add Photo Button */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary inline-flex items-center gap-2"
            >
              {showAddForm ? <FiX size={18} /> : <FiPlus size={18} />}
              {showAddForm ? 'Cancel' : 'Upload New Photo'}
            </button>
          </div>
        )}

        {/* Admin Add Photo Form */}
        <AnimatePresence>
          {showAddForm && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <form onSubmit={handleAddPhoto} className="card p-6 sm:p-8 max-w-xl mx-auto space-y-4">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-4">
                  📸 Add Photo to Gallery
                </h2>
                <div>
                  <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Sunday Biryani"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="input-field"
                    >
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Icon / Emoji</label>
                    <input
                      type="text"
                      placeholder="🍚, 🥗, 🍳"
                      value={newItem.emoji}
                      onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Short caption describing the photo..."
                    value={newItem.desc}
                    onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-3">
                  Upload Photo
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              {cat === 'All' && <FiGrid className="inline mr-1.5" size={14} />}
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              custom={index + 2}
              className="group cursor-pointer"
              onClick={() => openLightbox(item)}
            >
              <div className="card overflow-hidden relative">
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeletePhoto(item.id, e)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/40 hover:bg-red-600 text-white transition-colors"
                    title="Delete Photo"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}

                {/* Image placeholder with gradient */}
                <div className={`aspect-square bg-gradient-to-br ${item.gradient || 'from-primary-500 to-emerald-500'} relative flex items-center justify-center overflow-hidden`}>
                  <span className="text-7xl opacity-80 group-hover:scale-125 transition-transform duration-500">
                    {item.emoji || '📸'}
                  </span>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <FiImage className="text-white" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-dark-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                    {item.category}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="card p-16 text-center max-w-md mx-auto">
            <span className="text-4xl mb-4 block">📷</span>
            <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
              No photos in gallery
            </h3>
            <p className="text-dark-500 dark:text-dark-400 text-sm">
              {isAdmin ? 'Click "Upload New Photo" above to add photos.' : 'Check back later for gallery updates.'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <FiX size={20} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <FiChevronRight size={24} />
            </button>

            <motion.div
              key={lightbox.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`aspect-video bg-gradient-to-br ${lightbox.gradient || 'from-primary-500 to-emerald-500'} rounded-3xl flex items-center justify-center shadow-2xl mb-6`}>
                <span className="text-9xl">{lightbox.emoji || '📸'}</span>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-white mb-2">{lightbox.title}</h2>
                <p className="text-white/60">{lightbox.desc}</p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
                  {lightbox.category}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
