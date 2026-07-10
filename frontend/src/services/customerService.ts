import api from './api';

export const customerService = {
  list: (params?: any) => api.get('/customers/', { params }),
  get: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers/', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  sales: (id: number) => api.get(`/customers/${id}/sales`),
};
