import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const reportService = {
  getSummary: async () => {
    try {
      const res = await api.get('/reports/summary');
      return res;
    } catch {
      const complaints = dataStorage.getComplaints();
      const feedback = dataStorage.getFeedback();
      const pendingComplaints = complaints.filter((c) => c.status === 'PENDING').length;
      return {
        data: {
          totalStudents: 1, // Current logged user
          pendingStudents: 0,
          totalFeedback: feedback.length,
          pendingComplaints,
        },
      };
    }
  },
};