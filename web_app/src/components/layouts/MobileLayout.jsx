import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, BarChart2, ReceiptText, MoreHorizontal, Menu, Search, MessageCircle, ScanLine, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SidebarDrawer from './SidebarDrawer';
import SupportModal from '../SupportModal';
import './MobileLayout.css'; 

const MobileLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
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
        <button className="btn-icon header-store-btn" onClick={() => setIsMenuOpen(true)}>
          <Store size={22} color="#00B14F" />
        </button>
        <div className="mobile-search-bar">
          <Search size={16} color="#999" />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button className="btn-icon header-scan-btn" onClick={() => alert("Mở camera quét mã vạch")}>
            <ScanLine size={22} />
          </button>
          <button className="btn-icon header-chat-btn" onClick={() => setShowSupport(true)}>
            <MessageCircle size={22} />
            <span className="chat-badge">3</span>
          </button>
        </div>
      </header>

      <SidebarDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="main-content mobile-content">
        <Outlet />
      </main>

      <nav className="bottom-nav glass">
        <NavLink to="/dashboard" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Trang chủ</span>
        </NavLink>
        
        <NavLink to="/dashboard/reports" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <BarChart2 size={24} />
          <span>Báo cáo</span>
        </NavLink>
        
        <NavLink to="/dashboard/orders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ReceiptText size={24} />
          <span>Đơn hàng</span>
        </NavLink>

        <div className="bottom-nav-item" onClick={() => setIsMenuOpen(true)}>
          <MoreHorizontal size={24} />
          <span>Thêm</span>
        </div>
      </nav>

      <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
};

export default MobileLayout;
