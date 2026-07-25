import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiHash, FiHome, FiEdit2, FiCheck,
  FiShield, FiCamera, FiCreditCard, FiUpload, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import StudentPollsWidget from '../components/polls/StudentPollsWidget';
import toast from 'react-hot-toast';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '');

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    hostelRoom: user?.hostelRoom || '',
    department: user?.department || '',
    year: user?.year || '',
  });

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  // ID card upload state
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const idInputRef = useRef(null);

  // Lightbox state
  const [lightbox, setLightbox] = useState(null); // null | 'photo' | 'id'

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleIdSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIdFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setIdPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      if (idFile) fd.append('idCard', idFile);

      const res = await authService.updateProfile(fd);
      updateProfile(res.data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setIdFile(null);
      setIdPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      hostelRoom: user?.hostelRoom || '',
      department: user?.department || '',
      year: user?.year || '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIdFile(null);
    setIdPreview(null);
  };

  const photoSrc = photoPreview || buildImageUrl(user?.photoUrl);
  const idSrc = buildImageUrl(user?.idCardUrl);

  return (
    <div className="page-container">
      <div className="content-container max-w-4xl space-y-10">

        {/* ── Profile Card ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="card overflow-hidden">

            {/* Header banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 text-white relative">
              <div className="flex flex-col sm:flex-row items-center gap-6">

                {/* Avatar with photo */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/30 flex items-center justify-center text-4xl shadow-xl overflow-hidden cursor-pointer"
                    onClick={() => photoSrc && setLightbox('photo')}
                    title={photoSrc ? 'View photo' : ''}
                  >
                    {photoSrc
                      ? <img src={photoSrc} alt="Student photo" className="w-full h-full object-cover" />
                      : <span>👨‍🎓</span>
                    }
                  </div>
                  {/* Camera overlay button */}
                  {isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-primary-600 flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors"
                        title="Change photo"
                      >
                        <FiCamera size={14} />
                      </button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </>
                  )}
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold">{user?.name || 'Student Profile'}</h1>
                  <p className="text-primary-200 mt-1 text-sm">{user?.role} • {user?.department || 'Department'}</p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                    Status: {user?.status || 'APPROVED'}
                  </span>
                </div>

                <button
                  onClick={() => (isEditing ? cancelEdit() : setIsEditing(true))}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-sm font-medium transition-all flex items-center gap-2"
                >
                  {isEditing ? <FiX size={16} /> : <FiEdit2 size={16} />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-8">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Hostel Room</label>
                      <input type="text" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Department</label>
                      <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" />
                    </div>
                  </div>

                  {/* ID Card Upload */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
                      <FiCreditCard className="inline mr-1" size={14} /> College ID Card
                    </label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-28 h-20 rounded-xl bg-dark-100 dark:bg-dark-800 border-2 border-dashed border-dark-300 dark:border-dark-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
                        onClick={() => idInputRef.current?.click()}
                        title="Click to change ID card"
                      >
                        {idPreview || idSrc
                          ? <img src={idPreview || idSrc} alt="ID Card" className="w-full h-full object-cover" />
                          : <FiCreditCard className="text-dark-400" size={24} />
                        }
                      </div>
                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => idInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-200 dark:border-dark-700 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        >
                          <FiUpload size={14} /> {idFile ? 'Change ID Card' : 'Upload ID Card'}
                        </button>
                        {idFile && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{idFile.name}</p>}
                        <p className="text-xs text-dark-400 mt-1">JPG, PNG — Max 2MB</p>
                        <input ref={idInputRef} type="file" accept="image/*" className="hidden" onChange={handleIdSelect} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-800">
                    <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <FiCheck size={16} />
                      }
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoItem icon={<FiUser />} label="Full Name" value={user?.name || '-'} />
                    <InfoItem icon={<FiMail />} label="Email Address" value={user?.email || '-'} />
                    <InfoItem icon={<FiHash />} label="Roll Number" value={user?.rollNumber || 'N/A'} />
                    <InfoItem icon={<FiPhone />} label="Phone" value={user?.phone || '-'} />
                    <InfoItem icon={<FiHome />} label="Hostel Room" value={user?.hostelRoom || 'N/A'} />
                    <InfoItem icon={<FiShield />} label="Department & Year" value={`${user?.department || '-'} (${user?.year || '-'})`} />
                  </div>

                  {/* Documents section */}
                  <div className="pt-6 border-t border-dark-100 dark:border-dark-800">
                    <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-4 flex items-center gap-2">
                      <FiCreditCard size={14} className="text-primary-500" /> Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Passport Photo */}
                      <div className="p-4 rounded-2xl bg-dark-50 dark:bg-dark-800/50">
                        <p className="text-xs text-dark-400 mb-3 flex items-center gap-1">
                          <FiCamera size={12} /> Passport Photo
                        </p>
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt="Passport Photo"
                            className="w-24 h-24 rounded-xl object-cover border-2 border-primary-200 dark:border-primary-700 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                            onClick={() => setLightbox('photo')}
                            title="Click to view full size"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-dark-200 dark:bg-dark-700 flex flex-col items-center justify-center text-dark-400 text-xs gap-1">
                            <FiCamera size={20} />
                            <span>No photo</span>
                          </div>
                        )}
                      </div>

                      {/* ID Card */}
                      <div className="p-4 rounded-2xl bg-dark-50 dark:bg-dark-800/50">
                        <p className="text-xs text-dark-400 mb-3 flex items-center gap-1">
                          <FiCreditCard size={12} /> College ID Card
                        </p>
                        {idSrc ? (
                          <img
                            src={idSrc}
                            alt="College ID Card"
                            className="w-full max-w-[180px] h-24 rounded-xl object-cover border-2 border-primary-200 dark:border-primary-700 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                            onClick={() => setLightbox('id')}
                            title="Click to view full size"
                          />
                        ) : (
                          <div className="w-full max-w-[180px] h-24 rounded-xl bg-dark-200 dark:bg-dark-700 flex flex-col items-center justify-center text-dark-400 text-xs gap-1">
                            <FiCreditCard size={20} />
                            <span>No ID card</span>
                          </div>
                        )}
                      </div>

                    </div>
                    {!photoSrc && !idSrc && (
                      <p className="text-xs text-dark-400 mt-3">
                        💡 Click <strong>Edit Profile</strong> to upload your photo and ID card.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Polls ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <StudentPollsWidget />
        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setLightbox(null)}
          >
            <FiX size={20} />
          </button>
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            src={lightbox === 'photo' ? photoSrc : idSrc}
            alt={lightbox === 'photo' ? 'Passport Photo' : 'College ID Card'}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-white/60 text-sm">
            {lightbox === 'photo' ? '📸 Passport Photo' : '🪪 College ID Card'}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-50 dark:bg-dark-800/50">
      <span className="text-primary-500 text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-dark-400">{label}</p>
        <p className="font-semibold text-dark-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
