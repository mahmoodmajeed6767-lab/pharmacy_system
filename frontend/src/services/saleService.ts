import api from './api';

export const saleService = {
  list: (params?: any) => api.get('/sales/', { params }),
  get: (id: number) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales/', data),
  refund: (id: number) => api.post(`/sales/${id}/refund`),
};
