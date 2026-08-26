import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, User, Settings, CreditCard, HelpCircle, LogOut, BookOpen, 
  Headset, Users, Gift, Star, Package, UserCircle, Book, Plus, Store, Edit2
} from 'lucide-react';
import axios from 'axios';
import './SidebarDrawer.css';

export default function SidebarDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [shopName, setShopName] = React.useState(user?.store?.name || 'Chủ cửa hàng');

  const handleEditName = async () => {
    const newName = window.prompt("Nhập tên Shop mới:", shopName);
    if (newName && newName.trim() !== "") {
      try {
        await axios.put('/api/stores/updateName', { name: newName });
        setShopName(newName);
      } catch (err) {
        alert('Có lỗi xảy ra khi đổi tên.');
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className={`drawer-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      
      {/* Drawer */}
      <div className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        {/* Cột Store Switcher bên trái */}
        <div className="drawer-store-switcher">
          <div className="store-icon active">
            <Store size={20} color="white" />
          </div>
          <div className="store-icon add-new">
            <Plus size={20} color="#666" />
          </div>
        </div>

        {/* Nội dung chính bên phải */}
        <div className="drawer-main-content">
          <div className="drawer-header">
            <div className="drawer-user-info">
              <div className="user-avatar">
                <User size={24} color="#00B14F" />
              </div>
              <div className="user-text">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <h3>{shopName}</h3>
                  <button className="btn-icon" style={{padding: 4}} onClick={handleEditName}>
                    <Edit2 size={14} color="#666" />
                  </button>
                </div>
                <p>Gói cước: Miễn phí</p>
              </div>
            </div>
            <button className="btn-close-drawer" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="drawer-banner">
            <h4>Nâng cấp gói cước</h4>
            <p>Mở khóa toàn bộ tính năng quản lý cửa hàng</p>
            <button>Xem gói cước</button>
          </div>

          <div className="drawer-menu">
            <div className="drawer-menu-item">
              <BookOpen size={20} color="#666" />
              <span>Hướng dẫn dùng Số</span>
            </div>
            <div className="drawer-menu-item">
              <Headset size={20} color="#666" />
              <span>Hỗ trợ</span>
            </div>
            <div className="drawer-menu-item">
              <Users size={20} color="#666" />
              <span>Cộng đồng bán hàng</span>
            </div>
            <div className="drawer-menu-item">
              <Gift size={20} color="#666" />
              <span>Giới thiệu & Nhận thưởng</span>
            </div>
            <div className="drawer-menu-item">
              <Star size={20} color="#666" />
              <span>Đánh giá Số</span>
            </div>
            <div className="drawer-menu-item">
              <Package size={20} color="#666" />
              <span>Gói của tôi</span>
            </div>
            <div className="drawer-menu-item">
              <Settings size={20} color="#666" />
              <span>Cài đặt Cửa hàng</span>
            </div>
            <div className="drawer-menu-item">
              <UserCircle size={20} color="#666" />
              <span>Cài đặt cá nhân</span>
            </div>
            <div className="drawer-menu-item">
              <Book size={20} color="#666" />
              <span>Mở Sổ Thu Tiền</span>
            </div>
            <div className="drawer-menu-item" onClick={() => logout()}>
              <LogOut size={20} color="#ef4444" />
              <span style={{color: '#ef4444'}}>Đăng xuất</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
