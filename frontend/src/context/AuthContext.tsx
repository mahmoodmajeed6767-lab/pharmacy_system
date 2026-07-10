import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isPharmacist: boolean;
  isCashier: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAdmin: false,
  isPharmacist: false,
  isCashier: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);
    localStorage.setItem('token', res.access_token);
    const userData = 'user' in res ? (res as any).user : res;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const role = user?.role?.name || '';
  const isAdmin = role === 'Admin';
  const isPharmacist = role === 'Pharmacist';
  const isCashier = role === 'Cashier';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isPharmacist, isCashier }}>
      {children}
    </AuthContext.Provider>
  );
}
