import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const menuService = {
  getTodayMenu: async () => {
    try {
      const res = await api.get('/menus/today');
      return res;
    } catch {
      const all = dataStorage.getMenu();
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const today = days[new Date().getDay()];
      return { data: all[today] || { breakfast: [], lunch: [], dinner: [] } };
    }
  },

  getWeeklyMenu: async () => {
    try {
      const res = await api.get('/menus/weekly');
      return res;
    } catch {
      return { data: dataStorage.getMenu() };
    }
  },

  getMenuByDay: async (day) => {
    try {
      const res = await api.get(`/menus/${day}`);
      return res;
    } catch {
      const all = dataStorage.getMenu();
      return { data: all[day.toUpperCase()] || { breakfast: [], lunch: [], dinner: [] } };
    }
  },

  updateMenu: async (day, data) => {
    try {
      const res = await api.put(`/menus/${day}`, data);
      dataStorage.updateDayMenu(day, data);
      return res;
    } catch {
      const updated = dataStorage.updateDayMenu(day, data);
      return { data: updated[day.toUpperCase()] };
    }
  },

  updateWeeklyMenu: async (data) => {
    try {
      const res = await api.put('/menus/weekly', data);
      Object.keys(data).forEach((d) => dataStorage.updateDayMenu(d, data[d]));
      return res;
    } catch {
      Object.keys(data).forEach((d) => dataStorage.updateDayMenu(d, data[d]));
      return { data: dataStorage.getMenu() };
    }
  },
};
