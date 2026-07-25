import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiPhone, FiHash, FiHome,
  FiCamera, FiCreditCard, FiEye, FiEyeOff, FiArrowRight, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, YEARS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [step, setStep] = useState(1);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleIdChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'rollNumber', 'department', 'year']);
    } else if (step === 2) {
      isValid = await trigger(['email', 'phone', 'hostelRoom', 'password']);
    }
    if (isValid) setStep(step + 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'photo' || key === 'idCard') {
          if (data[key]?.[0]) formData.append(key, data[key][0]);
        } else {
          formData.append(key, data[key]);
        }
      });

      await registerUser(formData);
      toast.success('Registration successful! Awaiting admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal' },
    { num: 2, label: 'Account' },
    { num: 3, label: 'Documents' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-hero-pattern relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="relative text-center p-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <span className="text-white font-display font-bold text-3xl">N</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Join North Mess</h2>
          <p className="text-white/60 text-lg max-w-sm">
            Register to start enjoying delicious and nutritious meals every day.
          </p>

          {/* Benefits */}
          <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
            {[
              '3 nutritious meals daily',
              'Weekly feedback system',
              'Digital menu access',
              'Community dining experience',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-white/70">
                <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                  <FiCheck size={12} className="text-primary-300" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-dark-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="lg:hidden mb-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display font-bold text-xl">N</span>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold text-dark-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-dark-500 dark:text-dark-400 mb-8">
            Fill in your details to register for North Mess
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${
                  step >= s.num ? 'text-primary-600 dark:text-primary-400' : 'text-dark-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step > s.num
                      ? 'bg-primary-500 text-white'
                      : step === s.num
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500'
                        : 'bg-dark-100 dark:bg-dark-800 text-dark-400'
                  }`}>
                    {step > s.num ? <FiCheck size={14} /> : s.num}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded ${step > s.num ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-700'}`}></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                      type="text"
                      placeholder="Akash Raj"
                      className="input-field pl-11"
                      {...register('name', { required: 'Name is required' })}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Roll Number</label>
                  <div className="relative">
                    <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                      type="text"
                      placeholder="21CSE001"
                      className="input-field pl-11"
                      {...register('rollNumber', { required: 'Roll number is required' })}
                    />
                  </div>
                  {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Department</label>
                    <select className="input-field" {...register('department', { required: 'Required' })}>
                      <option value="">Select</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Year</label>
                    <select className="input-field" {...register('year', { required: 'Required' })}>
                      <option value="">Select</option>
                      {YEARS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                    {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
                  </div>
                </div>

                <button type="button" onClick={nextStep} className="w-full btn-primary flex items-center justify-center gap-2">
                  Next Step <FiArrowRight />
                </button>
              </motion.div>
            )}

            {/* Step 2: Account Info */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                      type="email"
                      placeholder="akash@university.edu"
                      className="input-field pl-11"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                      })}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      className="input-field pl-11"
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^[0-9]{10}$/, message: '10 digit phone number required' },
                      })}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Hostel Room Number</label>
                  <div className="relative">
                    <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                      type="text"
                      placeholder="A-204"
                      className="input-field pl-11"
                      {...register('hostelRoom', { required: 'Room number is required' })}
                    />
                  </div>
                  {errors.hostelRoom && <p className="text-red-500 text-sm mt-1">{errors.hostelRoom.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      className="input-field pl-11 pr-11"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' },
                      })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    Next <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Passport Size Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-dark-100 dark:bg-dark-800 border-2 border-dashed border-dark-300 dark:border-dark-600 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiCamera className="text-dark-400" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="input-field text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400"
                        {...register('photo')}
                        onChange={handlePhotoChange}
                      />
                      <p className="text-xs text-dark-400 mt-1">JPG, PNG. Max 2MB</p>
                    </div>
                  </div>
                </div>

                {/* ID Card Upload */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    College ID Card
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-dark-100 dark:bg-dark-800 border-2 border-dashed border-dark-300 dark:border-dark-600 flex items-center justify-center overflow-hidden">
                      {idPreview ? (
                        <img src={idPreview} alt="ID Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiCreditCard className="text-dark-400" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="input-field text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400"
                        {...register('idCard')}
                        onChange={handleIdChange}
                      />
                      <p className="text-xs text-dark-400 mt-1">JPG, PNG. Max 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                    {...register('terms', { required: 'You must agree to the terms' })}
                  />
                  <span className="text-sm text-dark-600 dark:text-dark-400">
                    I agree to the mess rules and regulations, and confirm all information provided is accurate.
                  </span>
                </label>
                {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 btn-secondary">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Register <FiArrowRight /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-dark-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
