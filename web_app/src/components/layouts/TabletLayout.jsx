import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, DollarSign, LogOut } from 'lucide-react';
import './DesktopLayout.css'; // Dùng chung CSS base của Desktop nhưng sẽ custom bằng CSS

const TabletLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
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
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} title="Tổng quan">
            <Home size={24} />
          </NavLink>
          
          <NavLink to="/pos" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} title="Bán hàng">
            <ShoppingCart size={24} />
          </NavLink>
          
          <NavLink to="/products" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} title="Sản phẩm">
            <Package size={24} />
          </NavLink>

          <NavLink to="/cashflow" className={({ isActive }) => `nav-item compact ${isActive ? 'active' : ''}`} title="Sổ quỹ">
            <DollarSign size={24} />
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout compact" onClick={handleLogout} title="Đăng xuất">
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
