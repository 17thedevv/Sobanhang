import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, ReceiptText, UserPlus, Wallet, 
  ShoppingCart, PlusSquare, LayoutGrid, PackagePlus,
  Hourglass, CheckCircle2, AlertTriangle, ArrowRight,
  Eye, EyeOff, BookOpen, Users, Package, AppWindow,
  X, MessageCircle, HeartHandshake
} from 'lucide-react';
import './Dashboard.css';
import FloatingActionButton from '../components/FloatingActionButton';
import SupportModal from '../components/SupportModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboardStats } = useApp();
  const { products, orders } = useApp();
  const { user } = useAuth();

  const [showRevenue, setShowRevenue] = useState(() => {
    const saved = localStorage.getItem('sobanhang_showRevenue');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFirstOrderBanner, setShowFirstOrderBanner] = useState(true);

  const toggleRevenue = () => {
    setShowRevenue(prev => {
      const newVal = !prev;
      localStorage.setItem('showRevenue', String(newVal));
      localStorage.setItem('sobanhang_showRevenue', JSON.stringify(newVal));
      return newVal;
    });
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0đ';
    return showRevenue ? `${val.toLocaleString('vi-VN')}đ` : '***';
  };

  // Actual data from backend
  const revenue = dashboardStats?.revenue || 0;
  const ordersCount = dashboardStats?.ordersCount || 0;

  // Mock data for UI visual complexity
  const mockData = {
    discount: 0,
    refund: 0,
    avgOrderValue: ordersCount > 0 ? Math.round(revenue / ordersCount) : 0,
    customersPerOrder: ordersCount > 0 ? 1 : 0,
    newCustomers: 0,
    returningCustomers: 0,
    totalIncome: revenue,
    totalExpense: 0,
    
    reviewItems: [
      { id: 'pending', title: 'Đơn chờ xác nhận', count: 0, icon: <Hourglass size={18} color="#eab308" />, bg: '#fef9c3' },
      { id: 'processing', title: 'Đơn đang xử lý', count: 0, icon: <CheckCircle2 size={18} color="#3b82f6" />, bg: '#dbeafe' },
      { id: 'outOfStock', title: 'Sản phẩm hết hàng', count: 0, icon: <PackagePlus size={18} color="#ef4444" />, bg: '#fee2e2' },
      { id: 'lowStock', title: 'Sản phẩm tồn kho thấp', count: 0, icon: <AlertTriangle size={18} color="#f59e0b" />, bg: '#fef3c7' },
      { id: 'debt', title: 'Khách hàng cân nhắc nợ', count: 0, icon: <Wallet size={18} color="#8b5cf6" />, bg: '#ede9fe' },
    ]
  };

  return (
    <div className="dashboard-container">
      {ordersCount === 0 && showFirstOrderBanner && (
        <div className="first-order-banner">
          <div className="banner-content">
            <div className="banner-icon-bg">
              <Package size={24} color="#00B14F" />
            </div>
            <div className="banner-text">
              <h4>Hướng dẫn sử dụng Cửa Hàng Số</h4>
              <p>Tạo đơn hàng đầu tiên của bạn ngay! Tặng 7 ngày sử dụng miễn phí.</p>
            </div>
          </div>
          <div className="banner-actions">
            <button className="btn-create-first-order" onClick={() => navigate('/dashboard/pos')}>
              Tạo đơn hàng
            </button>
            <button className="btn-close-banner" onClick={() => setShowFirstOrderBanner(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="section-header-row">
        <h2 className="section-title">Bức tranh kinh doanh</h2>
        <button className="btn-toggle-revenue" onClick={toggleRevenue} title={showRevenue ? "Ẩn số tiền" : "Hiện số tiền"}>
          {showRevenue ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      {/* 4 STATS CARDS */}
      <div className="stats-grid-4">
        {/* Doanh thu */}
        <div className="stat-card-custom bg-blue-card">
          <div className="card-header">
            <span className="card-title">Doanh thu hôm nay</span>
            <div className="card-icon bg-white"><TrendingUp size={16} color="#3b82f6" /></div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{formatCurrency(revenue)}</h3>
            <p className="card-compare">so với hôm qua</p>
          </div>
          <div className="card-footer">
            <div className="footer-row">
              <span className="footer-label">Giảm giá hóa đơn</span>
              <span className="footer-value">{formatCurrency(mockData.discount)}</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">Trả hàng (0)</span>
              <span className="footer-value">{formatCurrency(mockData.refund)}</span>
            </div>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="stat-card-custom bg-green-card">
          <div className="card-header">
            <span className="card-title">Đơn hàng hôm nay</span>
            <div className="card-icon bg-white"><ReceiptText size={16} color="#10b981" /></div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{ordersCount} <span className="text-sm font-normal">đơn</span></h3>
            <p className="card-compare">so với hôm qua</p>
          </div>
          <div className="card-footer">
            <div className="footer-row">
              <span className="footer-label">Trung bình đơn</span>
              <span className="footer-value">{formatCurrency(mockData.avgOrderValue)}</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">Số khách/đơn</span>
              <span className="footer-value">{mockData.customersPerOrder}</span>
            </div>
          </div>
        </div>

        {/* Khách hàng */}
        <div className="stat-card-custom bg-yellow-card">
          <div className="card-header">
            <span className="card-title">Khách mới</span>
            <div className="card-icon bg-white"><UserPlus size={16} color="#f59e0b" /></div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{mockData.newCustomers} <span className="text-sm font-normal">khách</span></h3>
            <p className="card-compare">so với hôm qua</p>
          </div>
          <div className="card-footer">
            <div className="footer-row" style={{ marginTop: 'auto' }}>
              <span className="footer-label">Khách quay lại</span>
              <span className="footer-value text-black font-medium">{mockData.returningCustomers}</span>
            </div>
          </div>
        </div>

        {/* Tổng thu chi */}
        <div className="stat-card-custom bg-purple-card">
          <div className="card-header">
            <span className="card-title">Tổng thu - chi</span>
            <div className="card-icon bg-white"><Wallet size={16} color="#8b5cf6" /></div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{formatCurrency(mockData.totalIncome - mockData.totalExpense)}</h3>
            <p className="card-compare">Số dư so với hôm qua</p>
          </div>
          <div className="card-footer">
            <div className="footer-row">
              <span className="footer-label">Tổng thu</span>
              <span className="footer-value">{formatCurrency(mockData.totalIncome)}</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">Tổng chi</span>
              <span className="footer-value">{formatCurrency(mockData.totalExpense)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="dashboard-middle">
        
        {/* Cột trái: Cần xem xét */}
        <div className="middle-col review-col">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <ReceiptText size={18} color="#f59e0b" />
                <h3>Cần xem xét</h3>
              </div>
              <a href="#" className="link-text">Xem tất cả</a>
            </div>
            <div className="panel-list">
              {mockData.reviewItems.map(item => (
                <div className="list-item" key={item.id}>
                  <div className="item-icon-box" style={{ backgroundColor: item.bg }}>
                    {item.icon}
                  </div>
                  <span className="item-title">{item.title}</span>
                  <div className="item-count-box">
                    <span className="item-count">{item.count}</span>
                    <ArrowRight size={16} color="#999" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Thao tác nhanh & Banner */}
        <div className="middle-col actions-col">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <LayoutGrid size={18} color="#2563eb" />
                <h3>Tính năng cho bạn</h3>
              </div>
            </div>

            <div className="features-grid">
              <div className="action-btn" onClick={() => navigate('/dashboard/pos')}>
                <div className="action-icon bg-green-light text-green"><ShoppingCart size={24} /></div>
                <span>Bán hàng</span>
              </div>
              <div className="action-btn" onClick={() => navigate('/dashboard/products')}>
                <div className="action-icon bg-blue-light text-blue"><Package size={24} /></div>
                <span>Sản phẩm</span>
              </div>
              <div className="action-btn mockup">
                <div className="action-icon bg-yellow-light text-yellow"><Users size={24} /></div>
                <span>Khách hàng</span>
              </div>
              <div className="action-btn" onClick={() => navigate('/dashboard/cashflow')}>
                <div className="action-icon bg-purple-light text-purple"><Wallet size={24} /></div>
                <span>Thu chi</span>
              </div>
              <div className="action-btn mockup">
                <div className="action-icon" style={{background: '#ffe4e6', color: '#e11d48'}}><BookOpen size={24} /></div>
                <span>Sổ nợ</span>
              </div>
              <div className="action-btn mockup">
                <div className="action-icon bg-gray-light text-gray"><AppWindow size={24} /></div>
                <span>Kho ứng dụng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner cột ngoài cùng bên phải */}
        <div className="middle-col ad-banner-col">
          <div className="ad-banner">
            <div className="ad-content">
              <h4>ƯU ĐÃI DUY NHẤT TRONG NĂM</h4>
              <h2>CHỈ <span>99K</span> / THÁNG</h2>
              <button className="btn-buy-now">MUA NGAY</button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Banner Hỗ trợ */}
      <div className="support-banner" onClick={() => setShowSupportModal(true)}>
        <div className="support-icon">
          <HeartHandshake size={24} color="#00B14F" />
        </div>
        <div className="support-text">
          <h4>Bạn cần hỗ trợ?</h4>
          <p>Nhắn tin ngay tại đây nhé!</p>
        </div>
        <div className="support-arrow">
          <ArrowRight size={20} color="#999" />
        </div>
      </div>

      {/* FAB Nút Tạp nhanh */}
      <FloatingActionButton />

      {/* Modal Hỗ trợ */}
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  );
}
