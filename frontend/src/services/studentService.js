import api from './api';

export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  approve: (id) => api.put(`/students/${id}/approve`),
  reject: (id) => api.put(`/students/${id}/reject`),
  search: (query) => api.get('/students/search', { params: { q: query } }),
  delete: (id) => api.delete(`/students/${id}`),
};
