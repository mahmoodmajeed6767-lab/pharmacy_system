import api from './api';

export const prescriptionService = {
  list: (params?: any) => api.get('/prescriptions/', { params }),
  create: (formData: FormData) => api.post('/prescriptions/', formData),
  update: (id: number, data: any) => api.put(`/prescriptions/${id}`, data),
};
