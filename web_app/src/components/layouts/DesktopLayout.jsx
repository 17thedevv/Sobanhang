import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, DollarSign, LogOut } from 'lucide-react';
import './DesktopLayout.css'; // Sẽ tạo sau, hiện tại dùng chung hoặc tách riêng

const DesktopLayout = () => {
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
    <div className="layout-container desktop-layout">
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo-circle">SB</div>
          <h2>Sổ Bán Hàng</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} />
            <span>Tổng quan</span>
          </NavLink>
          
          <NavLink to="/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} />
            <span>Bán hàng (POS)</span>
          </NavLink>
          
          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            <span>Sản phẩm</span>
          </NavLink>

          <NavLink to="/cashflow" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <DollarSign size={20} />
            <span>Sổ quỹ</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DesktopLayout;
