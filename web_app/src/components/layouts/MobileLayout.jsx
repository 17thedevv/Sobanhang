import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Package, DollarSign, Menu } from 'lucide-react';
import './MobileLayout.css'; 

const MobileLayout = () => {
  return (
    <div className="layout-container mobile-layout">
      <header className="mobile-header glass">
        <div className="logo-circle-small">SB</div>
        <h3>Sổ Bán Hàng</h3>
        <button className="btn-icon"><Menu size={24} /></button>
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
