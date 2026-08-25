import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, Archive, Layers,
  DollarSign, Users, UserCircle, FileText, Settings,
  LogOut, Search, Bell, HelpCircle, ChevronDown, ChevronRight, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DesktopLayout.css';

const DesktopLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    sales: false,
    products: false,
    inventory: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Helper cho active state
  const isActivePaths = (paths) => paths.includes(location.pathname);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="layout-container desktop-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
            <span className="logo-icon">$</span>
            <span className="logo-text">SoBanHang</span>
          </div>
          <button className="sidebar-collapse-btn">
            <ChevronDown size={16} />
          </button>
        </div>
        
        <div className="sidebar-scroll">
          <div className="nav-section">
            <h4 className="nav-section-title">TỔNG QUAN</h4>
            <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Home size={18} className="nav-icon" />
              <span>Tổng quan</span>
            </NavLink>
            
            {/* BÁN HÀNG */}
            <div>
              <div 
                className={`nav-item ${location.pathname.includes('/pos') ? 'active-group' : ''}`}
                onClick={() => toggleMenu('sales')}
              >
                <ShoppingCart size={18} className="nav-icon" />
                <span>Bán hàng</span>
                <ChevronDown size={16} className={`nav-chevron ${expandedMenus.sales ? 'expanded' : ''}`} />
              </div>
              {expandedMenus.sales && (
                <div className="sub-nav">
                  <NavLink to="/dashboard/pos" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                    Mở POS Bán hàng
                  </NavLink>
                  <div className="sub-nav-item mockup">Quản lý đơn hàng</div>
                </div>
              )}
            </div>

            {/* HÀNG HÓA */}
            <div>
              <div 
                className={`nav-item ${location.pathname.includes('/products') ? 'active-group' : ''}`}
                onClick={() => toggleMenu('products')}
              >
                <Package size={18} className="nav-icon" />
                <span>Hàng hóa</span>
                <ChevronDown size={16} className={`nav-chevron ${expandedMenus.products ? 'expanded' : ''}`} />
              </div>
              {expandedMenus.products && (
                <div className="sub-nav">
                  <NavLink to="/dashboard/products" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                    Danh sách sản phẩm
                  </NavLink>
                  <NavLink to="/dashboard/categories" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                    Danh mục
                  </NavLink>
                </div>
              )}
            </div>

            {/* QUẢN LÝ KHO */}
            <div>
              <div 
                className="nav-item mockup"
                onClick={() => toggleMenu('inventory')}
              >
                <Archive size={18} className="nav-icon" />
                <span>Quản lý kho</span>
                <ChevronDown size={16} className={`nav-chevron ${expandedMenus.inventory ? 'expanded' : ''}`} />
              </div>
              {expandedMenus.inventory && (
                <div className="sub-nav">
                  <div className="sub-nav-item mockup">Tồn kho</div>
                  <div className="sub-nav-item mockup">Nhập kho</div>
                  <div className="sub-nav-item mockup">Xuất kho</div>
                </div>
              )}
            </div>

            <div className="nav-item mockup">
              <Layers size={18} className="nav-icon" />
              <span>Kênh bán hàng</span>
              <ChevronRight size={16} className="nav-chevron" />
            </div>
          </div>

          <div className="nav-section">
            <h4 className="nav-section-title">QUẢN LÝ</h4>
            <NavLink to="/dashboard/cashflow" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <DollarSign size={18} className="nav-icon" />
              <span>Tài chính</span>
              <ChevronRight size={16} className="nav-chevron" />
            </NavLink>
            <div className="nav-item mockup">
              <Users size={18} className="nav-icon" />
              <span>Đối tác</span>
              <ChevronRight size={16} className="nav-chevron" />
            </div>
            <div className="nav-item mockup">
              <UserCircle size={18} className="nav-icon" />
              <span>Nhân viên</span>
              <ChevronRight size={16} className="nav-chevron" />
            </div>
            <div className="nav-item mockup">
              <FileText size={18} className="nav-icon" />
              <span>Thuế</span>
              <ChevronRight size={16} className="nav-chevron" />
            </div>
            <div className="nav-item mockup">
              <Settings size={18} className="nav-icon" />
              <span>Cài đặt</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="app-version">v4.0.5</div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        {/* HEADER */}
        <header className="top-header">
          <div className="header-left">
            <Menu size={20} className="header-icon-btn" />
            <span className="header-title">
              {location.pathname === '/dashboard' ? 'Tổng quan' : 
               location.pathname.includes('/pos') ? 'Bán hàng (POS)' : 
               location.pathname.includes('/products') ? 'Hàng hóa' : 
               location.pathname.includes('/categories') ? 'Danh mục' : 
               location.pathname.includes('/cashflow') ? 'Tài chính' : 'Bảng điều khiển'}
            </span>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Tìm trang, chức năng..." />
              <span className="search-shortcut">Ctrl K</span>
            </div>
            
            <button className="icon-action-btn">
              <Bell size={20} />
            </button>
            <button className="icon-action-btn">
              <HelpCircle size={20} />
            </button>

            <div className="user-profile-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="avatar">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || user?.email?.split('@')[0] || 'Người dùng'}</span>
                <span className="user-role">{user?.role === 'OWNER' ? 'Chủ cửa hàng' : 'Nhân viên'}</span>
              </div>
              <ChevronDown size={16} className="dropdown-icon" />
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} /> Đăng xuất
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DesktopLayout;
