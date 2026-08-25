import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, ShoppingBag, DollarSign, PackageSearch } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { dashboardStats } = useApp();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('vi-VN');

  const revenue = dashboardStats?.revenue || 0;
  const ordersCount = dashboardStats?.ordersCount || 0;
  const topProducts = dashboardStats?.topProducts || [];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Xin chào, {user?.store?.name || 'Cửa Hàng'}</h1>
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
            <span className="stat-label">Tổng doanh thu</span>
            <h3 className="stat-value">{revenue.toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon bg-warning-light text-warning">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Số đơn hàng</span>
            <h3 className="stat-value">{ordersCount}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon bg-success-light text-success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hiệu suất</span>
            <h3 className="stat-value">Tốt</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {ordersCount === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon glass">🚀</div>
            <h3>Chưa có dữ liệu giao dịch</h3>
            <p>Hãy bắt đầu tạo sản phẩm và lên đơn hàng đầu tiên của bạn.</p>
          </div>
        ) : (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Top sản phẩm bán chạy</h3>
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(p => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.quantity}</td>
                      <td className="text-primary font-medium">{p.revenue.toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
