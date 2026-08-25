import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, DollarSign, Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './MobileLayout.css'; 

const MobileLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <div className="layout-container mobile-layout">
      <header className="mobile-header glass">
        <div className="logo-circle-small">CS</div>
        <h3>Cửa Hàng Số</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={handleLogout}><LogOut size={24} /></button>
          <button className="btn-icon"><Menu size={24} /></button>
        </div>
      </header>

      <main className="main-content mobile-content">
        <Outlet />
      </main>

      <nav className="bottom-nav glass">
        <NavLink to="/dashboard" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Tổng quan</span>
        </NavLink>
        
        <NavLink to="/dashboard/pos" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={24} />
          <span>Bán hàng</span>
        </NavLink>
        
        <NavLink to="/dashboard/products" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Package size={24} />
          <span>Sản phẩm</span>
        </NavLink>

        <NavLink to="/dashboard/cashflow" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={24} />
          <span>Sổ quỹ</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MobileLayout;
