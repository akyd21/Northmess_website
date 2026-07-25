import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const billingService = {
  getBillingConfig: async () => {
    try {
      const res = await api.get('/billing/config');
      return res;
    } catch {
      return { data: dataStorage.getBillingConfig() };
    }
  },

  updateBillingConfig: async (config) => {
    try {
      const res = await api.put('/billing/config', config);
      dataStorage.updateBillingConfig(config);
      return res;
    } catch {
      const updated = dataStorage.updateBillingConfig(config);
      return { data: updated };
    }
  },

  getStudentBillingSummary: async (user, month, year) => {
    try {
      const res = await api.get(`/billing/summary?month=${month}&year=${year}`);
      return res;
    } catch {
      return { data: dataStorage.getStudentBillingSummary(user, month, year) };
    }
  },

  getDailyBillingTracker: async (user, month, year) => {
    try {
      const res = await api.get(`/billing/tracker?month=${month}&year=${year}`);
      return res;
    } catch {
      return { data: dataStorage.getDailyBillingTracker(user, month, year) };
    }
  },

  getLeaveRequests: async () => {
    try {
      const res = await api.get('/leaves');
      return res;
    } catch {
      return { data: dataStorage.getLeaveRequests() };
    }
  },

  applyLeaveRequest: async (leaveData) => {
    try {
      const res = await api.post('/leaves', leaveData);
      dataStorage.applyLeaveRequest(res.data || leaveData);
      return res;
    } catch {
      const created = dataStorage.applyLeaveRequest(leaveData);
      return { data: created };
    }
  },

  updateLeaveStatus: async (leaveId, status) => {
    try {
      const res = await api.put(`/leaves/${leaveId}/status`, { status });
      dataStorage.updateLeaveStatus(leaveId, status);
      return res;
    } catch {
      dataStorage.updateLeaveStatus(leaveId, status);
      return { data: { success: true } };
    }
  },

  submitPayment: async (user, month, year, paymentData) => {
    try {
      const res = await api.post('/billing/payment', { month, year, paymentData });
      dataStorage.submitStudentPayment(user, month, year, paymentData);
      return res;
    } catch {
      const record = dataStorage.submitStudentPayment(user, month, year, paymentData);
      return { data: record };
    }
  },

  verifyPayment: async (recordId, status = 'PAID') => {
    try {
      const res = await api.put(`/billing/payment/${recordId}/verify`, { status });
      dataStorage.verifyStudentPayment(recordId, status);
      return res;
    } catch {
      dataStorage.verifyStudentPayment(recordId, status);
      return { data: { success: true } };
    }
  },
};
