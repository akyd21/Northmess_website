import { motion } from 'framer-motion';
import {
  FiPhone, FiMail, FiMapPin, FiClock, FiSend,
  FiMessageSquare, FiUser, FiExternalLink
} from 'react-icons/fi';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const contactDetails = [


];

const keyContacts = [
  { name: 'Sangam Yadav', role: 'Mess Secretary', phone: '+91 9519345606' },
  { name: 'Ajit kumar', role: 'Mess Supervisor', phone: '+91 79 79989459' },
  { name: 'Hostel Office', role: 'General Enquiries', phone: '+91 7654321098'},
];

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiMessageSquare size={14} />
            Get in Touch
          </span>
          <h1 className="section-title">Contact Us</h1>
          <p className="section-subtitle mt-4">
            Have questions or suggestions? Reach out to us through any channel
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
        >
          {contactDetails.map((item, index) => (
            <motion.div key={item.label} variants={fadeUp} custom={index + 1}>
              {item.link ? (
                <a href={item.link} className="card p-6 text-center group block">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.value}
                  </p>
                </a>
              ) : (
                <div className="card p-6 text-center group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">{item.value}</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Contact Form */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <div className="card p-8">
              <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                <FiSend className="text-primary-500" size={20} />
                Send a Message
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                      <input
                        type="text"
                        placeholder="Your name"
                        className="input-field pl-11"
                        {...register('name', { required: 'Name is required' })}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                      <input
                        type="email"
                        placeholder="you@university.edu"
                        className="input-field pl-11"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                        })}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="What is this about?"
                    className="input-field"
                    {...register('subject', { required: 'Subject is required' })}
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Write your message here..."
                    className="input-field resize-none"
                    {...register('message', {
                      required: 'Message is required',
                      minLength: { value: 10, message: 'Please write at least 10 characters' }
                    })}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
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
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Map + Key Contacts */}
          <div className="space-y-6">
            {/* Map */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <FiMapPin size={18} />
                    Our Location
                  </h3>
                  <p className="text-primary-200 text-sm mt-1">
                    North Hostel, University Campus, Main Road, City - 600001
                  </p>
                </div>
                {/* Map Embed Placeholder */}
                <div className="aspect-[16/10] bg-dark-100 dark:bg-dark-800 relative">
                  <iframe
                    title="North Mess Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.123456789!2d80.24!3d13.06!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzM2LjAiTiA4MMKwMTQnMjQuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                  {/* Fallback gradient if map doesn't load */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-dark-800 flex items-center justify-center pointer-events-none opacity-0 peer-invalid:opacity-100">
                    <div className="text-center">
                      <FiMapPin className="mx-auto text-primary-400 mb-2" size={32} />
                      <p className="text-sm text-dark-500">Map loading...</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Key Contacts */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
              <div className="card p-6">
                <h3 className="font-display font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiUser className="text-primary-500" size={18} />
                  Key Contacts
                </h3>
                <div className="space-y-4">
                  {keyContacts.map((contact) => (
                    <div
                      key={contact.name}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">
                          {contact.role === 'Mess Secretary' ? '👨‍💼' :
                           contact.role === 'Mess Supervisor' ? '👨‍🍳' : '🏢'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-dark-900 dark:text-white text-sm">{contact.name}</h4>
                        <p className="text-xs text-primary-600 dark:text-primary-400">{contact.role}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <a href={`tel:${contact.phone}`} className="text-xs text-dark-500 hover:text-primary-500 transition-colors flex items-center gap-1">
                            <FiPhone size={10} /> {contact.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Office Hours */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
              <div className="card p-6">
                <h3 className="font-display font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiClock className="text-primary-500" size={18} />
                  Office & Meal Hours
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Mess Office', time: '9:00 AM - 5:00 PM', days: 'Mon - Sat' },
                    { label: 'Breakfast', time: '7:30 AM - 9:30 AM', days: 'Daily' },
                    { label: 'Lunch', time: '12:00 PM - 2:00 PM', days: 'Daily' },
                    { label: 'Dinner', time: '8:30 PM - 9:30 PM', days: 'Daily' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white text-sm">{item.label}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{item.days}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
