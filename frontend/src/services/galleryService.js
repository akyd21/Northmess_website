import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const galleryService = {
  getAll: async () => {
    try {
      const res = await api.get('/gallery');
      return res;
    } catch {
      return { data: dataStorage.getGallery() };
    }
  },

  upload: async (data) => {
    try {
      const res = await api.post('/gallery', data);
      dataStorage.addGalleryItem(res.data || data);
      return res;
    } catch {
      const created = dataStorage.addGalleryItem(data);
      return { data: created };
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/gallery/${id}`);
      dataStorage.deleteGalleryItem(id);
      return res;
    } catch {
      dataStorage.deleteGalleryItem(id);
      return { data: { success: true } };
    }
  },
};
