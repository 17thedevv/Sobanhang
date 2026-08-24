import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreSetup from './pages/StoreSetup';
import FeatureSuggestions from './pages/FeatureSuggestions';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import CashFlow from './pages/CashFlow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/store-setup" element={<StoreSetup />} />
        <Route path="/suggestions" element={<FeatureSuggestions />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="pos" element={<POS />} />
          <Route path="cashflow" element={<CashFlow />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
