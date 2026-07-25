import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const complaintService = {
  submit: async (data) => {
    try {
      const res = await api.post('/complaints', data);
      dataStorage.addComplaint(res.data || data);
      return res;
    } catch {
      const created = dataStorage.addComplaint(data);
      return { data: created };
    }
  },

  getAll: async (params) => {
    try {
      const res = await api.get('/complaints', { params });
      return res;
    } catch {
      return { data: dataStorage.getComplaints() };
    }
  },

  getMy: async () => {
    try {
      const res = await api.get('/complaints/my');
      return res;
    } catch {
      return { data: dataStorage.getComplaints() };
    }
  },

  updateStatus: async (id, status, adminResponse = '') => {
    try {
      const res = await api.put(`/complaints/${id}/status`, { status, adminResponse });
      dataStorage.updateComplaintStatus(id, status, adminResponse);
      return res;
    } catch {
      const updated = dataStorage.updateComplaintStatus(id, status, adminResponse);
      return { data: updated };
    }
  },
};
