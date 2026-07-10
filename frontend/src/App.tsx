import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { loadCurrency } from './utils/format';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AllMedicines } from './pages/dashboard/AllMedicines';
import { LowStock } from './pages/dashboard/LowStock';
import { RevenueDetail } from './pages/dashboard/RevenueDetail';
import { AllCustomers } from './pages/dashboard/AllCustomers';
import { OrdersToday } from './pages/dashboard/OrdersToday';
import { ExpiredMedicines } from './pages/dashboard/ExpiredMedicines';
import { MedicineList } from './pages/medicines/MedicineList';
import { MedicineDetail } from './pages/medicines/MedicineDetail';
import { SupplierList } from './pages/suppliers/SupplierList';
import { CustomerList } from './pages/customers/CustomerList';
import { POS } from './pages/sales/POS';
import { SaleHistory } from './pages/sales/SaleHistory';
import { PrescriptionList } from './pages/prescriptions/PrescriptionList';
import { Reports } from './pages/reports/Reports';
import { Settings } from './pages/settings/Settings';
import { UserList } from './pages/users/UserList';
import { Notifications } from './pages/Notifications';

export default function App() {
  useEffect(() => { loadCurrency(); }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
        <AuthProvider>
          
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/medicines" element={<AllMedicines />} />
              <Route path="/dashboard/low-stock" element={<LowStock />} />
              <Route path="/dashboard/revenue" element={<RevenueDetail />} />
              <Route path="/dashboard/customers" element={<AllCustomers />} />
              <Route path="/dashboard/orders-today" element={<OrdersToday />} />
              <Route path="/dashboard/expired" element={<ExpiredMedicines />} />
              <Route path="/medicines" element={<MedicineList />} />
              <Route path="/medicines/:id" element={<MedicineDetail />} />
              <Route path="/suppliers" element={<SupplierList />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/sales" element={<SaleHistory />} />
              <Route path="/prescriptions" element={<PrescriptionList />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
