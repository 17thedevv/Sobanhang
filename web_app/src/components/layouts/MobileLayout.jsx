import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, DollarSign, Menu, LogOut } from 'lucide-react';
import './MobileLayout.css'; 

const MobileLayout = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const axios = require('axios').default || require('axios');
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
    navigate('/login');
  };

  return (
    <div className="layout-container mobile-layout">
      <header className="mobile-header glass">
        <div className="logo-circle-small">SB</div>
        <h3>Sổ Bán Hàng</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={handleLogout}><LogOut size={24} /></button>
          <button className="btn-icon"><Menu size={24} /></button>
        </div>
      </header>

      <main className="main-content mobile-content">
        <Outlet />
      </main>

      <nav className="bottom-nav glass">
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Tổng quan</span>
        </NavLink>
        
        <NavLink to="/pos" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={24} />
          <span>Bán hàng</span>
        </NavLink>
        
        <NavLink to="/products" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Package size={24} />
          <span>Sản phẩm</span>
        </NavLink>

        <NavLink to="/cashflow" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={24} />
          <span>Sổ quỹ</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MobileLayout;
