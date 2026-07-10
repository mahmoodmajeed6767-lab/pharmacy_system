import api from './api';

export const reportService = {
  sales: (params?: any) => api.get('/reports/sales', { params }),
  purchases: (params?: any) => api.get('/reports/purchases', { params }),
  profit: (params?: any) => api.get('/reports/profit', { params }),
  inventory: () => api.get('/reports/inventory'),
  expired: () => api.get('/reports/expired'),
  bestSelling: (params?: any) => api.get('/reports/best-selling', { params }),
  exportExcel: (params?: any) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
};
