import api from './api';
import { Medicine, MedicineCategory, PaginatedResponse } from '../types';

export const medicineService = {
  list: (params?: any) => api.get('/medicines/', { params }),
  get: (id: number) => api.get(`/medicines/${id}`),
  create: (data: Partial<Medicine>) => api.post('/medicines/', data),
  update: (id: number, data: Partial<Medicine>) => api.put(`/medicines/${id}`, data),
  delete: (id: number) => api.delete(`/medicines/${id}`),
  getByBarcode: (barcode: string) => api.get(`/medicines/barcode/${barcode}`),
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/medicines/import-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  exportExcel: () => api.get('/medicines/export/excel', { responseType: 'blob' }),
  listCategories: () => api.get('/categories/'),
  createCategory: (data: Partial<MedicineCategory>) => api.post('/categories/', data),
};
