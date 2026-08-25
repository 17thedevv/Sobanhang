import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, ReceiptText, UserPlus, Wallet, 
  ShoppingCart, PlusSquare, LayoutGrid, PackagePlus,
  Hourglass, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboardStats } = useApp();
  const { user } = useAuth();

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
      <h2 className="section-title">Bức tranh kinh doanh</h2>
      
      {/* 4 STATS CARDS */}
      <div className="stats-grid-4">
        {/* Doanh thu */}
        <div className="stat-card-custom bg-blue-card">
          <div className="card-header">
            <span className="card-title">Doanh thu hôm nay</span>
            <div className="card-icon bg-white"><TrendingUp size={16} color="#3b82f6" /></div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{revenue.toLocaleString('vi-VN')}đ</h3>
            <p className="card-compare">so với hôm qua</p>
          </div>
          <div className="card-footer">
            <div className="footer-row">
              <span className="footer-label">Giảm giá hóa đơn</span>
              <span className="footer-value">{mockData.discount}đ</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">Trả hàng (0)</span>
              <span className="footer-value">{mockData.refund}đ</span>
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
              <span className="footer-value">{mockData.avgOrderValue.toLocaleString('vi-VN')}đ</span>
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
            <h3 className="card-value">{(mockData.totalIncome - mockData.totalExpense).toLocaleString('vi-VN')}đ</h3>
            <p className="card-compare">Số dư so với hôm qua</p>
          </div>
          <div className="card-footer">
            <div className="footer-row">
              <span className="footer-label">Tổng thu</span>
              <span className="footer-value">{mockData.totalIncome.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">Tổng chi</span>
              <span className="footer-value">{mockData.totalExpense.toLocaleString('vi-VN')}đ</span>
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
                <TrendingUp size={18} color="#10b981" />
                <h3>Thao tác nhanh</h3>
              </div>
            </div>
            
            <div className="quick-pos-banner">
              <div className="pos-banner-text">
                <h4>POS Bán hàng — tạo đơn nhanh tại quầy</h4>
                <button className="btn-pos" onClick={() => navigate('/dashboard/pos')}>
                  <ShoppingCart size={16} />
                  Mở POS Bán hàng
                </button>
              </div>
            </div>

            <div className="quick-actions-grid">
              <div className="action-btn" onClick={() => navigate('/dashboard/pos')}>
                <div className="action-icon bg-green-light text-green"><PlusSquare size={24} /></div>
                <span>Tạo đơn hàng</span>
              </div>
              <div className="action-btn mockup">
                <div className="action-icon bg-blue-light text-blue"><LayoutGrid size={24} /></div>
                <span>Tạo đơn tại bàn</span>
              </div>
              <div className="action-btn" onClick={() => navigate('/dashboard/products')}>
                <div className="action-icon bg-blue-light text-blue"><PackagePlus size={24} /></div>
                <span>Tạo sản phẩm mới</span>
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
    </div>
  );
}
