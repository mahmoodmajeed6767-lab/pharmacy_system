import api from './api';

export const supplierService = {
  list: (params?: any) => api.get('/suppliers/', { params }),
  get: (id: number) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers/', data),
  update: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
  purchases: (id: number) => api.get(`/suppliers/${id}/purchases`),
};
