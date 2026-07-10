import api from './api';
import { LoginCredentials, TokenResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.data || data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return data;
  },
  updateProfile: async (payload: { full_name?: string; current_password?: string; new_password?: string }) => {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },
};
