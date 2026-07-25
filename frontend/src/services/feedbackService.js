import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const feedbackService = {
  submit: async (data) => {
    try {
      const res = await api.post('/feedback', data);
      dataStorage.addFeedback(res.data || data);
      return res;
    } catch {
      const created = dataStorage.addFeedback(data);
      return { data: created };
    }
  },

  getAll: async (params) => {
    try {
      const res = await api.get('/feedback', { params });
      return res;
    } catch {
      return { data: dataStorage.getFeedback() };
    }
  },

  getMy: async () => {
    try {
      const res = await api.get('/feedback/my');
      return res;
    } catch {
      return { data: dataStorage.getFeedback() };
    }
  },

  getAnalytics: async () => {
    try {
      const res = await api.get('/feedback/analytics');
      return res;
    } catch {
      const all = dataStorage.getFeedback();
      const total = all.length;
      return {
        data: {
          totalFeedback: total,
          avgRating: total > 0 ? (all.reduce((acc, f) => acc + (f.foodQuality || 4), 0) / total).toFixed(1) : 0,
          thisWeek: total,
        },
      };
    }
  },
};
