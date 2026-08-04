import api from './api';

export const paymentService = {
  getConfig: () => api.get('/payments/config'),
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getMyPayments: () => api.get('/payments/my-payments')
};
