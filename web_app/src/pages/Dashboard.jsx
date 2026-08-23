import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const today = new Date().toLocaleDateString('vi-VN');

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Xin chào, Cửa Hàng</h1>
          <p className="page-subtitle">Cập nhật hoạt động kinh doanh hôm nay</p>
        </div>
        <div className="date-badge">
          Hôm nay, {today}
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon bg-primary-light text-primary">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Doanh thu</span>
            <h3 className="stat-value">0đ</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon bg-warning-light text-warning">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đơn hàng</span>
            <h3 className="stat-value">0</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon bg-success-light text-success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Lợi nhuận</span>
            <h3 className="stat-value">0đ</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card empty-state">
          <div className="empty-icon glass">🚀</div>
          <h3>Chưa có dữ liệu giao dịch</h3>
          <p>Hãy bắt đầu tạo sản phẩm và lên đơn hàng đầu tiên của bạn.</p>
        </div>
      </div>
    </div>
  );
}
