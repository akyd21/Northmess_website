import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiMessageSquare, FiUser, FiGrid,
  FiBell, FiAlertCircle, FiArrowRight, FiCreditCard, FiUsers,
  FiPhone, FiMail,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import { announcementService } from '../services/announcementService';
import { staffService } from '../services/staffService';
import { getGreeting, getTodayName, capitalize, getCurrentMeal, formatDate } from '../utils/helpers';
import StudentPollsWidget from '../components/polls/StudentPollsWidget';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const today = getTodayName();
  const currentMeal = getCurrentMeal();
  const greeting = getGreeting();

  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, noticesRes, staffRes] = await Promise.all([
        menuService.getWeeklyMenu(),
        announcementService.getAll(),
        staffService.getAll(),
      ]);
      setWeeklyMenu(menuRes.data || {});
      setAnnouncements(Array.isArray(noticesRes.data) ? noticesRes.data.slice(0, 3) : []);
      setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleUpdate = () => fetchData();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchData]);

  const todayMenu = weeklyMenu[today] || { breakfast: [], lunch: [], dinner: [] };
  const currentMealItems = todayMenu[currentMeal] || [];

  const quickLinks = [
    {
      to: '/menu',
      icon: <FiCalendar size={24} />,
      title: "Today's Menu",
      desc: `${capitalize(today)} - ${capitalize(currentMeal)}`,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      to: '/feedback',
      icon: <FiMessageSquare size={24} />,
      title: 'Submit Feedback',
      desc: 'Rate this week\'s meals',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      to: '/profile',
      icon: <FiUser size={24} />,
      title: 'My Profile',
      desc: 'View & edit your profile',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      to: '/announcements',
      icon: <FiBell size={24} />,
      title: 'Notices',
      desc: 'Latest announcements',
      gradient: 'from-rose-500 to-red-500',
    },
    {
      to: '/complaints',
      icon: <FiAlertCircle size={24} />,
      title: 'Complaints',
      desc: 'Submit a complaint',
      gradient: 'from-teal-500 to-cyan-500',
    },
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Welcome Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="mb-10"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 sm:p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl md:text-4xl flex-shrink-0">
                👋
              </div>
              <div className="flex-1">
                <p className="text-primary-200 text-sm font-medium mb-1">{greeting}</p>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                  Hello, {user?.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-primary-200/70 mt-1 text-sm sm:text-base">
                  {capitalize(today)} • {user?.department || 'Student'} • {user?.year || '1st Year'}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-primary-200 text-sm">Room</p>
                <p className="text-white font-display font-bold text-lg">{user?.hostelRoom || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Meal Highlight */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="mb-10"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-dark-900 dark:text-white">
                🍽️ Current Meal — {capitalize(currentMeal)}
              </h3>
              <Link to="/menu" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                Full Menu <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentMealItems.length === 0 ? (
                <span className="text-sm text-dark-500">No items listed for current meal.</span>
              ) : (
                currentMealItems.map((item, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-medium">
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {quickLinks.map((link, index) => (
            <motion.div key={link.title} variants={fadeUp} custom={index + 2}>
              <Link
                to={link.to}
                className="card p-6 flex items-start gap-4 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
                    {link.desc}
                  </p>
                </div>
                <FiArrowRight className="text-dark-300 dark:text-dark-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Student Polls */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={8}
          className="mt-10"
        >
          <StudentPollsWidget limitActive={2} />
        </motion.div>

        {/* Recent Announcements */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={9}
          className="mt-10"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
                <FiBell className="text-primary-500" /> Recent Announcements
              </h3>
              <Link to="/announcements" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-sm text-dark-500 py-2">No recent announcements.</p>
              ) : (
                announcements.map((notice, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      notice.priority === 'important' ? 'bg-amber-500' : 'bg-primary-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{notice.title}</p>
                    </div>
                    <span className="text-xs text-dark-400 flex-shrink-0">{formatDate(notice.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
        {/* Staff Section */}
        {staffList.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={10}
            className="mt-10"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
                  <FiUsers className="text-primary-500" /> Our Mess Staff
                </h3>
                <Link to="/staff" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  View All <FiArrowRight size={14} />
                </Link>
              </div>

              {/* Secretary highlight */}
              {(() => {
                const secretary = staffList.find((s) =>
                  s.kind === 'SECRETARY' || s.role?.toLowerCase().includes('secretary')
                );
                return secretary ? (
                  <div className="mb-4 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 border border-primary-200 dark:border-primary-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg">
                      👨‍💼
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{secretary.role}</p>
                      <p className="font-display font-bold text-dark-900 dark:text-white">{secretary.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {secretary.phone && (
                          <a href={`tel:${secretary.phone}`} className="flex items-center gap-1 text-xs text-dark-500 dark:text-dark-400 hover:text-primary-600 transition-colors">
                            <FiPhone size={11} /> {secretary.phone}
                          </a>
                        )}
                        {secretary.email && (
                          <a href={`mailto:${secretary.email}`} className="flex items-center gap-1 text-xs text-dark-500 dark:text-dark-400 hover:text-primary-600 transition-colors">
                            <FiMail size={11} /> {secretary.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Kitchen staff grid */}
              {(() => {
                const kitchen = staffList.filter(
                  (s) => s.kind !== 'SECRETARY' && !s.role?.toLowerCase().includes('secretary')
                ).slice(0, 4);
                return kitchen.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {kitchen.map((cook) => (
                      <div key={cook.id} className="p-3 rounded-2xl bg-dark-50 dark:bg-dark-800/50 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl">👨‍🍳</span>
                        </div>
                        <p className="text-sm font-semibold text-dark-900 dark:text-white truncate">{cook.name}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 truncate">{cook.role}</p>
                        {cook.workingSince && (
                          <p className="text-xs text-dark-400 mt-1">Since {cook.workingSince}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
