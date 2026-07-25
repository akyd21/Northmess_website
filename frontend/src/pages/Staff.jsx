import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiAward, FiCalendar, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { staffService } from '../services/staffService';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Staff() {
  const { isAdmin } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    phone: '',
    workingSince: new Date().getFullYear().toString(),
  });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await staffService.getAll();
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load staff list');
    }
  }, []);

  useEffect(() => {
    fetchStaff();

    const handleUpdate = () => fetchStaff();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchStaff]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) {
      toast.error('Name and role are required');
      return;
    }
    try {
      await staffService.create(newStaff);
      toast.success('Staff member added successfully');
      setNewStaff({ name: '', role: '', phone: '', workingSince: new Date().getFullYear().toString() });
      setShowAddForm(false);
      fetchStaff();
    } catch {
      toast.error('Failed to add staff member');
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      await staffService.delete(id);
      toast.success('Staff member removed');
      fetchStaff();
    } catch {
      toast.error('Failed to delete staff member');
    }
  };

  const secretary = staffList.find((s) => s.role.toLowerCase().includes('secretary')) || staffList[0];
  const kitchenStaff = staffList.filter((s) => s !== secretary);

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            Our Team
          </span>
          <h1 className="section-title">Meet Our Staff</h1>
          <p className="section-subtitle mt-4">
            The dedicated team behind your daily meals at North Mess
          </p>
        </motion.div>

        {/* Admin Add Staff Button */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary inline-flex items-center gap-2"
            >
              {showAddForm ? <FiX size={18} /> : <FiPlus size={18} />}
              {showAddForm ? 'Cancel' : 'Add Staff Member'}
            </button>
          </div>
        )}

        {/* Admin Add Staff Form */}
        <AnimatePresence>
          {showAddForm && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleAddStaff} className="card p-6 sm:p-8 max-w-2xl mx-auto space-y-4">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-4">
                  ➕ Add New Staff Member
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Chef Murugan"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Role</label>
                    <input
                      type="text"
                      placeholder="Head Cook"
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">Working Since (Year)</label>
                    <input
                      type="text"
                      placeholder="2020"
                      value={newStaff.workingSince}
                      onChange={(e) => setNewStaff({ ...newStaff, workingSince: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary font-medium py-3">
                  Save Staff Member
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mess Secretary */}
        {secretary && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-16">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 sm:p-12 relative">
                <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <span className="text-5xl">👨‍💼</span>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="badge bg-white/10 text-white/80 border border-white/20 mb-3">
                      {secretary.role || 'Mess Secretary'}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
                      {secretary.name}
                    </h2>
                    <p className="text-primary-200 text-sm sm:text-base">{secretary.department || 'Management'}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                      {secretary.phone && (
                        <a href={`tel:${secretary.phone}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                          <FiPhone size={14} /> {secretary.phone}
                        </a>
                      )}
                      {secretary.email && (
                        <a href={`mailto:${secretary.email}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                          <FiMail size={14} /> {secretary.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-12">
                <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-3">
                  💬 Message to Students
                </h3>
                <blockquote className="text-dark-600 dark:text-dark-400 leading-relaxed italic border-l-4 border-primary-500 pl-6 py-2">
                  "{secretary.message || 'Our goal is to provide every student with nutritious, tasty, and hygienic food.'}"
                </blockquote>
              </div>
            </div>
          </motion.div>
        )}

        {/* Kitchen Staff */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white text-center mb-10">
            👨‍🍳 Our Kitchen Team
          </h2>

          {kitchenStaff.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-4xl mb-4 block">👨‍🍳</span>
              <p className="text-dark-500 dark:text-dark-400">No kitchen staff added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {kitchenStaff.map((cook, index) => (
                <motion.div
                  key={cook.id || cook.name}
                  variants={fadeUp}
                  custom={index + 3}
                  className="card p-6 text-center group relative"
                >
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteStaff(cook.id)}
                      className="absolute top-4 right-4 p-2 text-dark-400 hover:text-red-500 transition-colors"
                      title="Remove Staff"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}

                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">👨‍🍳</span>
                  </div>
                  <h3 className="font-display font-bold text-dark-900 dark:text-white">{cook.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{cook.role}</p>

                  <div className="mt-4 space-y-2 text-sm">
                    {cook.experience && (
                      <div className="flex items-center justify-center gap-2 text-dark-500 dark:text-dark-400">
                        <FiAward size={14} className="text-primary-500" />
                        {cook.experience} experience
                      </div>
                    )}
                    {cook.workingSince && (
                      <div className="flex items-center justify-center gap-2 text-dark-500 dark:text-dark-400">
                        <FiCalendar size={14} className="text-primary-500" />
                        Since {cook.workingSince}
                      </div>
                    )}
                  </div>

                  {cook.specialDishes && (
                    <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700">
                      <p className="text-xs font-medium text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-1">Special Dishes</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">{cook.specialDishes}</p>
                    </div>
                  )}

                  {cook.contact && (
                    <a
                      href={`tel:${cook.contact}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <FiPhone size={12} /> {cook.contact}
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
