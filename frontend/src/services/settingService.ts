import api from './api';

export const settingService = {
  get: () => api.get('/settings/'),
  update: (key: string, value: string) => api.put(`/settings/${key}`, { value }),
};
