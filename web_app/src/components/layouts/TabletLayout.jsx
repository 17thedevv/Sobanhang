import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, DollarSign, LogOut, BookOpen, Users } from 'lucide-react';
import './DesktopLayout.css'; // Dùng chung CSS base của Desktop nhưng sẽ custom bằng CSS

const TabletLayout = () => {
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
    <div className="layout-container tablet-layout">
      {/* Sidebar thu gọn (Compact Sidebar) */}
      <aside className="sidebar compact glass">
        <div className="sidebar-header">
          <div className="logo-circle">SB</div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} data-tooltip="Tổng quan">
            <Home size={24} />
          </NavLink>
          
          <NavLink to="/dashboard/pos" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} data-tooltip="Bán hàng">
            <ShoppingCart size={24} />
          </NavLink>
          
          <NavLink to="/dashboard/products" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} data-tooltip="Sản phẩm">
            <Package size={24} />
          </NavLink>

          <NavLink to="/dashboard/cashflow" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} data-tooltip="Sổ quỹ">
            <DollarSign size={24} />
          </NavLink>

          <NavLink to="/dashboard/debt" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} data-tooltip="Sổ nợ">
            <BookOpen size={24} />
          </NavLink>

          <NavLink to="/dashboard/customers" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} data-tooltip="Khách hàng">
            <Users size={24} />
          </NavLink>
        </nav>

        <div className="sidebar-footer compact">
          <button className="btn-logout compact" onClick={handleLogout} data-tooltip="Đăng xuất">
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default TabletLayout;
