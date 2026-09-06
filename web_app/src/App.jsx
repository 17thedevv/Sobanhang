import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import axios from 'axios';

const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const VerifyOtp = React.lazy(() => import('./pages/VerifyOtp'));
const StoreSetup = React.lazy(() => import('./pages/StoreSetup'));
const FeatureSuggestions = React.lazy(() => import('./pages/FeatureSuggestions'));
const OnboardingPreference = React.lazy(() => import('./pages/OnboardingPreference'));
const SetPassword = React.lazy(() => import('./pages/SetPassword'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const VerifyResetOtp = React.lazy(() => import('./pages/VerifyResetOtp'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const Categories = React.lazy(() => import('./pages/Categories'));
const POS = React.lazy(() => import('./pages/POS'));
const Orders = React.lazy(() => import('./pages/Orders'));
const CashFlow = React.lazy(() => import('./pages/CashFlow'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DebtLedger = React.lazy(() => import('./pages/DebtLedger'));
const DebtTransactionForm = React.lazy(() => import('./pages/DebtTransactionForm'));
const CustomerDebtDetail = React.lazy(() => import('./pages/CustomerDebtDetail'));
const DebtReminders = React.lazy(() => import('./pages/DebtReminders'));
const CustomerList = React.lazy(() => import('./pages/CustomerList'));
const CustomerForm = React.lazy(() => import('./pages/CustomerForm'));
const CustomerDetail = React.lazy(() => import('./pages/CustomerDetail'));
const GroupDetail = React.lazy(() => import('./pages/GroupDetail'));
const StockReceiptList = React.lazy(() => import('./pages/StockReceiptList'));
const StockReceiptForm = React.lazy(() => import('./pages/StockReceiptForm'));
const StockReceiptDetail = React.lazy(() => import('./pages/StockReceiptDetail'));

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://sobanhang-api.onrender.com';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('sbh_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('sbh_access_token');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(err);
});

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>
    <div>Đang tải...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
              
              {/* Các trang onboarding không dùng ProtectedRoute vì user chưa có accessToken, chỉ có setupToken */}
              <Route path="/store-setup" element={<StoreSetup />} />
              <Route path="/suggestions" element={<FeatureSuggestions />} />
              <Route path="/preference" element={<OnboardingPreference />} />
              <Route path="/set-password" element={<SetPassword />} />
              
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/verify-reset-otp" element={<PublicRoute><VerifyResetOtp /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="pos" element={<POS />} />
                <Route path="orders" element={<Orders />} />
                <Route path="cashflow" element={<CashFlow />} />
                <Route path="debt" element={<DebtLedger />} />
                <Route path="debt/new" element={<DebtTransactionForm />} />
                <Route path="debt/reminders" element={<DebtReminders />} />
                <Route path="debt/customer/:customerId" element={<CustomerDebtDetail />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/new" element={<CustomerForm />} />
                <Route path="customers/:customerId" element={<CustomerDetail />} />
                <Route path="customers/:customerId/edit" element={<CustomerForm />} />
                <Route path="customers/groups/:groupId" element={<GroupDetail />} />
                <Route path="stock-receipts" element={<StockReceiptList />} />
                <Route path="stock-receipts/new" element={<StockReceiptForm />} />
                <Route path="stock-receipts/:id" element={<StockReceiptDetail />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
