import api from './api';

export const staffService = {
  getAll: async () => {
    const res = await api.get('/staff');
    return res;
  },

  create: async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    const res = await api.post('/staff', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res;
  },

  update: async (id, data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    return api.put(`/staff/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: async (id) => {
    return api.delete(`/staff/${id}`);
  },
};

