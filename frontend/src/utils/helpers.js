import { DAYS } from './constants';

/**
 * Get today's day name (e.g., "MONDAY")
 */
export const getTodayName = () => {
  return DAYS[new Date().getDay()];
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString) => {
  const options = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Get current meal type based on time
 */
export const getCurrentMeal = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
};

/**
 * Truncate text
 */
export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Generate avatar color from name
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-primary-500', 'bg-accent-500', 'bg-blue-500',
    'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
    'bg-indigo-500', 'bg-rose-500',
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

/**
 * Calculate average rating
 */
export const calculateAverageRating = (feedback) => {
  if (!feedback) return 0;
  const { foodQuality, taste, hygiene, quantity, staffBehaviour, cleanliness } = feedback;
  const total = (foodQuality || 0) + (taste || 0) + (hygiene || 0) +
    (quantity || 0) + (staffBehaviour || 0) + (cleanliness || 0);
  return (total / 6).toFixed(1);
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * File to Base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
