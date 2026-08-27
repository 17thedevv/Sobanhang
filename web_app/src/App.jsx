import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import StoreSetup from './pages/StoreSetup';
import FeatureSuggestions from './pages/FeatureSuggestions';
import OnboardingPreference from './pages/OnboardingPreference';
import SetPassword from './pages/SetPassword';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import POS from './pages/POS';
import Orders from './pages/Orders';
import CashFlow from './pages/CashFlow';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://sobanhang-api.onrender.com';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('sbh_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
