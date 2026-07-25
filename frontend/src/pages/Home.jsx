import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiCalendar, FiStar, FiShield,
  FiCoffee, FiHeart, FiAward, FiBookOpen
} from 'react-icons/fi';
import { GiMeal, GiKnifeFork } from 'react-icons/gi';
import { menuService } from '../services/menuService';
import { getTodayName, capitalize } from '../utils/helpers';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function useScrollAnimation() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = ref.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const scrollRef = useScrollAnimation();
  const today = getTodayName();
  const [weeklyMenu, setWeeklyMenu] = useState({});

  const fetchMenu = useCallback(async () => {
    try {
      const res = await menuService.getWeeklyMenu();
      setWeeklyMenu(res.data || {});
    } catch (err) {
      console.error('Failed to load menu on home:', err);
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    const handleUpdate = () => fetchMenu();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchMenu]);

  const todayMenu = weeklyMenu[today] || { breakfast: [], lunch: [], dinner: [] };
  const orderedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div ref={scrollRef} className="min-h-screen">
      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-pattern"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
              Welcome to North Mess
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.05] mb-6">
              Healthy Food,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-accent-400">
                Happy Students
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
              Experience quality dining with nutritious meals, a clean environment, and caring staff dedicated to fueling your academic success.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                View Today's Menu
                <FiArrowRight />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                Register Now
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-8 mt-16">
              {[
                { label: 'Students Served', value: '500+' },
                { label: 'Meals Daily', value: '1500+' },
                { label: 'Years of Service', value: '15+' },
                { label: 'Satisfaction', value: '4.5★' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-display font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs">Scroll down</span>
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/50 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TODAY'S MENU ═══════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
              <FiCalendar size={14} />
              Auto-updated daily
            </span>
            <h2 className="section-title">
              🍽️ Today's Menu
              <span className="block text-primary-500 text-2xl md:text-3xl mt-2">
                {capitalize(today)}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { type: 'breakfast', icon: <FiCoffee />, emoji: '🌅', gradient: 'from-amber-500 to-orange-500', label: 'Breakfast', time: '7:30 - 9:30 AM' },
              { type: 'lunch', icon: <GiMeal />, emoji: '☀️', gradient: 'from-primary-500 to-emerald-500', label: 'Lunch', time: '12:00 - 2:00 PM' },
              { type: 'dinner', icon: <GiKnifeFork />, emoji: '🌙', gradient: 'from-indigo-500 to-purple-500', label: 'Dinner', time: '7:00 - 9:00 PM' },
            ].map((meal, index) => (
              <div
                key={meal.type}
                className="animate-on-scroll card group overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Meal header */}
                <div className={`bg-gradient-to-r ${meal.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl mb-2 block">{meal.emoji}</span>
                      <h3 className="text-xl font-display font-bold">{meal.label}</h3>
                      <p className="text-white/70 text-sm mt-1">{meal.time}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur-sm">
                      {meal.icon}
                    </div>
                  </div>
                </div>
                {/* Menu items */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {(todayMenu[meal.type]?.length ?? 0) === 0 ? (
                      <li className="rounded-xl border border-dashed border-dark-200 dark:border-dark-700 px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                        No items listed for this meal.
                      </li>
                    ) : (
                      todayMenu[meal.type]?.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 group/item">
                          <span className="w-2 h-2 rounded-full bg-primary-400 group-hover/item:scale-150 transition-transform"></span>
                          <span className="text-dark-700 dark:text-dark-300 group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors font-medium">
                            {item}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all"
            >
              View Full Weekly Menu <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ ABOUT SECTION ═══════════════ */}
      <section className="py-20 md:py-28 bg-dark-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
              About Us
            </span>
            <h2 className="section-title">About North Mess</h2>
            <p className="section-subtitle mt-4">
              Serving quality meals with love and dedication for over 15 years
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-on-scroll">
              <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-white mb-4">Our Story</h3>
              <p className="text-dark-600 dark:text-dark-400 leading-relaxed mb-4">
                North Mess has been the heart of student dining since its establishment. What started as a small canteen
                has grown into a full-fledged dining facility serving hundreds of students daily with nutritious,
                home-style meals.
              </p>
              <p className="text-dark-600 dark:text-dark-400 leading-relaxed">
                Our commitment to quality, hygiene, and student satisfaction has made us one of the most loved
                mess facilities on campus. We believe that good food is the foundation of good education.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-on-scroll">
              {[
                { icon: <FiHeart />, title: 'Mission', desc: 'Provide nutritious, affordable meals that make students feel at home.' },
                { icon: <FiStar />, title: 'Vision', desc: 'Be the benchmark for hostel dining excellence across the nation.' },
                { icon: <FiShield />, title: 'Hygiene', desc: 'FSSAI certified kitchen with daily sanitization protocols.' },
                { icon: <FiAward />, title: 'Quality', desc: 'Fresh ingredients sourced daily from local farms and markets.' },
              ].map((item) => (
                <div key={item.title} className="glass-card text-center group">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-dark-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-dark-500 dark:text-dark-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ WEEKLY SCHEDULE ═══════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
              <FiBookOpen size={14} />
              Weekly Plan
            </span>
            <h2 className="section-title">Weekly Mess Schedule</h2>
            <p className="section-subtitle mt-4">
              Plan your week with our complete meal schedule
            </p>
          </div>

          <div className="animate-on-scroll overflow-x-auto rounded-2xl border border-dark-100 dark:border-dark-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">Day</th>
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">🌅 Breakfast</th>
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">☀️ Lunch</th>
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">🌙 Dinner</th>
                </tr>
              </thead>
              <tbody>
                {orderedDays.map((day, index) => {
                  const menu = weeklyMenu[day] || { breakfast: [], lunch: [], dinner: [] };
                  const isToday = day === today;
                  return (
                    <tr
                      key={day}
                      className={`border-b border-dark-100 dark:border-dark-800 transition-colors ${
                        isToday
                          ? 'bg-primary-50 dark:bg-primary-900/10 font-medium'
                          : index % 2 === 0
                            ? 'bg-white dark:bg-dark-950'
                            : 'bg-dark-50/50 dark:bg-dark-900/50'
                      } hover:bg-primary-50/50 dark:hover:bg-primary-900/5`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isToday && <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>}
                          <span className={`font-semibold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-dark-900 dark:text-white'}`}>
                            {capitalize(day)}
                          </span>
                          {isToday && <span className="badge-success text-xs">Today</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {menu.breakfast?.join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {menu.lunch?.join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {menu.dinner?.join(', ') || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center animate-on-scroll">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Join North Mess?
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Register today and enjoy nutritious meals, a clean dining environment, and become part of our mess community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Register Now <FiArrowRight />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
