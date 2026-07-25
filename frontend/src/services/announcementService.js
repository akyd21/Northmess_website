import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const announcementService = {
  getAll: async () => {
    try {
      const res = await api.get('/announcements');
      return res;
    } catch {
      return { data: dataStorage.getAnnouncements() };
    }
  },

  create: async (data) => {
    try {
      const res = await api.post('/announcements', data);
      dataStorage.addAnnouncement(res.data || data);
      return res;
    } catch {
      const created = dataStorage.addAnnouncement(data);
      return { data: created };
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/announcements/${id}`, data);
    } catch {
      return { data };
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/announcements/${id}`);
      dataStorage.deleteAnnouncement(id);
      return res;
    } catch {
      dataStorage.deleteAnnouncement(id);
      return { data: { success: true } };
    }
  },
};
