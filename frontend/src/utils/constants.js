// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Days of the week
export const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// Departments
export const DEPARTMENTS = [
  'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML',
  'Chemical', 'Biotech', 'MBA', 'MCA', 'Physics', 'Chemistry', 'Maths' , 'SFE'
];

// Years
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Student status
export const STUDENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Complaint status
export const COMPLAINT_STATUS = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
};

// Complaint categories
export const COMPLAINT_CATEGORIES = [
  'Food', 'Water', 'Cleanliness', 'Staff Behaviour', 'Others'
];

// Feedback categories
export const FEEDBACK_CATEGORIES = [
  { key: 'foodQuality', label: 'Food Quality', emoji: '🍽️' },
  { key: 'taste', label: 'Taste', emoji: '😋' },
  { key: 'hygiene', label: 'Hygiene', emoji: '🧼' },
  { key: 'quantity', label: 'Quantity', emoji: '📏' },
  { key: 'staffBehaviour', label: 'Staff Behaviour', emoji: '👨‍🍳' },
  { key: 'cleanliness', label: 'Cleanliness', emoji: '✨' },
];

// Menu meal types
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

// Navigation links
export const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/staff', label: 'Staff' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/contact', label: 'Contact' },
];

export const STUDENT_NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/menu', label: 'Menu' },
  { path: '/billing', label: 'Mess Fee' },
  { path: '/staff', label: 'Staff' },
  { path: '/polls', label: 'Polls' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/complaints', label: 'Complaints' },
  { path: '/announcements', label: 'Notices' },
];

export const ADMIN_NAV_LINKS = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/students', label: 'Students' },
  { path: '/admin/polls', label: 'Polls' },
  { path: '/admin/menu', label: 'Menu' },
  { path: '/admin/feedback', label: 'Feedback' },
  { path: '/admin/complaints', label: 'Complaints' },
  { path: '/admin/announcements', label: 'Announcements' },
  { path: '/admin/staff', label: 'Staff' },
];

// Sample menu data
export const SAMPLE_MENU = {
  MONDAY: {
    breakfast: [],
    lunch: ['Dal', 'Chawal', 'Aloo Bhujiya', 'Papad'],
    dinner: ['Roti', 'Sabji', 'Kheer'],
  },
  TUESDAY: {
    breakfast: [],
    lunch: ['Dal', 'Chawal', 'Aloo-Bhindi Bhujiya', 'Papad'],
    dinner: ['Puri', 'Sabji'],
  },
  WEDNESDAY: {
    breakfast: [],
    lunch: ['Dal', 'Chawal', 'Soyabean Sabji', 'Papad'],
    dinner: ['Roti', 'Paneer / Chicken'],
  },
  THURSDAY: {
    breakfast: [],
    lunch: ['Kadhi', 'Chawal', 'Pakora', 'Bhujiya'],
    dinner: ['Aloo Paratha / Sattu Paratha'],
  },
  FRIDAY: {
    breakfast: [],
    lunch: ['Rajma / Chana', 'Chawal', 'Papad', 'Curd'],
    dinner: ['Egg / Veg', 'Roti'],
  },
  SATURDAY: {
    breakfast: [],
    lunch: ['Chokha', 'Chawal', 'Dal', 'Papad'],
    dinner: ['Roti', 'Mix Veg / Manchurian'],
  },
  SUNDAY: {
    breakfast: [],
    lunch: ['Jeera Rice', 'Tadka', 'Papad'],
    dinner: ['Paneer / Chicken Biryani'],
  },
};
