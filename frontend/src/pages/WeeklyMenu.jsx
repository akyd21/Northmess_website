import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCoffee, FiSun, FiMoon, FiCalendar, FiEdit3, FiX, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import { getTodayName, capitalize } from '../utils/helpers';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function WeeklyMenu() {
  const { isAdmin } = useAuth();
  const today = getTodayName();
  const [selectedDay, setSelectedDay] = useState(today);
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [editMealData, setEditMealData] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [newInputs, setNewInputs] = useState({ breakfast: '', lunch: '', dinner: '' });

  const orderedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const fetchMenu = useCallback(async () => {
    try {
      const res = await menuService.getWeeklyMenu();
      setWeeklyMenu(res.data || {});
    } catch {
      toast.error('Failed to load menu');
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    const handleUpdate = () => fetchMenu();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchMenu]);

  const currentDayMenu = weeklyMenu[selectedDay] || { breakfast: [], lunch: [], dinner: [] };

  const meals = [
    { key: 'breakfast', label: 'Breakfast', icon: <FiCoffee size={22} />, time: '7:30 - 9:30 AM', emoji: '🌅', gradient: 'from-amber-500 to-orange-500' },
    { key: 'lunch', label: 'Lunch', icon: <FiSun size={22} />, time: '12:00 - 2:00 PM', emoji: '☀️', gradient: 'from-primary-500 to-emerald-500' },
    { key: 'dinner', label: 'Dinner', icon: <FiMoon size={22} />, time: '7:00 - 9:00 PM', emoji: '🌙', gradient: 'from-indigo-500 to-purple-500' },
  ];

  const handleOpenEdit = (day) => {
    const dayMenu = weeklyMenu[day] || { breakfast: [], lunch: [], dinner: [] };
    setEditMealData({
      breakfast: [...(dayMenu.breakfast || [])],
      lunch: [...(dayMenu.lunch || [])],
      dinner: [...(dayMenu.dinner || [])],
    });
    setEditingDay(day);
  };

  const handleAddItem = (mealKey) => {
    const val = newInputs[mealKey].trim();
    if (!val) return;
    setEditMealData((prev) => ({
      ...prev,
      [mealKey]: [...prev[mealKey], val],
    }));
    setNewInputs((prev) => ({ ...prev, [mealKey]: '' }));
  };

  const handleRemoveItem = (mealKey, index) => {
    setEditMealData((prev) => ({
      ...prev,
      [mealKey]: prev[mealKey].filter((_, i) => i !== index),
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await menuService.updateMenu(editingDay, editMealData);
      toast.success(`${capitalize(editingDay)}'s menu updated successfully!`);
      setEditingDay(null);
      fetchMenu();
    } catch {
      toast.error('Failed to update menu');
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <FiCalendar size={14} />
            Mess Menu
          </span>
          <h1 className="section-title">Weekly Mess Menu</h1>
          <p className="section-subtitle mt-4">
            Select a day to view or edit the meal plan
          </p>
        </motion.div>

        {/* Day Selector */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            {orderedDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedDay === day
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : day === today
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-2 ring-primary-300 dark:ring-primary-700'
                      : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                }`}
              >
                {capitalize(day).slice(0, 3)}
                {day === today && selectedDay !== day && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary-500 inline-block"></span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Day Title & Admin Edit Action */}
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white">
            🍽️ {capitalize(selectedDay)}'s Menu
            {selectedDay === today && (
              <span className="ml-3 badge-success text-xs">Today</span>
            )}
          </h2>

          {isAdmin && (
            <button
              onClick={() => handleOpenEdit(selectedDay)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <FiEdit3 size={16} /> Edit {capitalize(selectedDay)} Menu
            </button>
          )}
        </motion.div>

        {/* Meal Cards */}
        <motion.div
          key={selectedDay + '-meals'}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {meals.map((meal, index) => (
            <motion.div
              key={meal.key}
              variants={fadeUp}
              custom={index}
              className="card overflow-hidden group"
            >
              <div className={`bg-gradient-to-r ${meal.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">{meal.emoji}</span>
                    <h3 className="text-xl font-display font-bold">{meal.label}</h3>
                    <p className="text-white/70 text-sm mt-1">{meal.time}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    {meal.icon}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {(currentDayMenu[meal.key]?.length ?? 0) === 0 ? (
                    <li className="rounded-xl border border-dashed border-dark-200 dark:border-dark-700 px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                      No items listed for this meal.
                    </li>
                  ) : (
                    currentDayMenu[meal.key]?.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {i + 1}
                        </div>
                        <span className="text-dark-700 dark:text-dark-300 font-medium group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">
                          {item}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Full Weekly Schedule */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white text-center mb-8">
            📋 Complete Weekly Schedule
          </h2>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-dark-100 dark:border-dark-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">Day</th>
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">🌅 Breakfast</th>
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">☀️ Lunch</th>
                  <th className="px-6 py-4 text-left font-display font-semibold text-sm">🌙 Dinner</th>
                  {isAdmin && <th className="px-6 py-4 text-center font-display font-semibold text-sm">Action</th>}
                </tr>
              </thead>
              <tbody>
                {orderedDays.map((day, index) => {
                  const dayMenu = weeklyMenu[day] || { breakfast: [], lunch: [], dinner: [] };
                  const isToday = day === today;
                  return (
                    <tr
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`border-b border-dark-100 dark:border-dark-800 cursor-pointer transition-colors ${
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
                        {dayMenu.breakfast?.join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {dayMenu.lunch?.join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {dayMenu.dinner?.join(', ') || '-'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(day); }}
                            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title="Edit Day Menu"
                          >
                            <FiEdit3 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack */}
          <div className="md:hidden space-y-4">
            {orderedDays.map((day) => {
              const dayMenu = weeklyMenu[day] || { breakfast: [], lunch: [], dinner: [] };
              const isToday = day === today;
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`card p-5 cursor-pointer ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
                      {capitalize(day)}
                      {isToday && <span className="badge-success text-xs">Today</span>}
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(day); }}
                        className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        <FiEdit3 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-dark-700 dark:text-dark-300">🌅 B:</span> {dayMenu.breakfast?.join(', ') || 'None'}</p>
                    <p><span className="font-semibold text-dark-700 dark:text-dark-300">☀️ L:</span> {dayMenu.lunch?.join(', ') || 'None'}</p>
                    <p><span className="font-semibold text-dark-700 dark:text-dark-300">🌙 D:</span> {dayMenu.dinner?.join(', ') || 'None'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {editingDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-100 dark:border-dark-800">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white">
                  ✏️ Edit Menu — {capitalize(editingDay)}
                </h2>
                <button onClick={() => setEditingDay(null)} className="p-2 text-dark-400 hover:text-dark-600">
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {['breakfast', 'lunch', 'dinner'].map((mealKey) => (
                  <div key={mealKey} className="p-4 rounded-2xl bg-dark-50 dark:bg-dark-800/50">
                    <h3 className="font-semibold text-dark-900 dark:text-white capitalize mb-3">
                      {mealKey === 'breakfast' ? '🌅 Breakfast' : mealKey === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editMealData[mealKey].map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-sm font-medium text-dark-800 dark:text-dark-200">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(mealKey, i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Add item to ${mealKey}...`}
                        value={newInputs[mealKey]}
                        onChange={(e) => setNewInputs((prev) => ({ ...prev, [mealKey]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(mealKey); } }}
                        className="input-field text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem(mealKey)}
                        className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-medium flex items-center gap-1"
                      >
                        <FiPlus size={16} /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-dark-100 dark:border-dark-800">
                <button onClick={() => setEditingDay(null)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn-primary flex items-center gap-2">
                  <FiCheck size={16} /> Save Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
