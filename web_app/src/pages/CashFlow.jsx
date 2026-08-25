import { useApp } from '../context/AppContext';
import { DollarSign, ArrowUpRight, ArrowDownRight, Building2, Wallet } from 'lucide-react';
import './CashFlow.css';

export default function CashFlow() {
  const { orders } = useApp();

  // Tính toán doanh thu thực nhận (Không tính nợ)
  const paidOrders = orders.filter(o => !o.isDebt);
  const cashTotal = paidOrders
    .filter(o => o.paymentMethod === 'Tiền mặt')
    .reduce((sum, o) => sum + o.total, 0);
  
  const bankTotal = paidOrders
    .filter(o => o.paymentMethod === 'Chuyển khoản')
    .reduce((sum, o) => sum + o.total, 0);

  const totalFund = cashTotal + bankTotal;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sổ Quỹ</h1>
          <p className="page-subtitle">Quản lý dòng tiền và các tài khoản</p>
        </div>
      </header>

      <div className="fund-summary-card card bg-primary-gradient text-white">
        <div className="fund-header">
          <span>Tổng quỹ hiện tại</span>
          <Wallet size={24} />
        </div>
        <h2 className="fund-total">{totalFund.toLocaleString('vi-VN')}đ</h2>
      </div>

      <h3 className="section-title">Danh sách nguồn tiền</h3>
      
      <div className="fund-sources">
        <div className="card source-card">
          <div className="source-icon cash">
            <DollarSign size={24} />
          </div>
          <div className="source-info">
            <h4>Tiền mặt</h4>
            <span className="source-amount text-success">{cashTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <button className="btn-icon"><ArrowUpRight size={20} /></button>
        </div>

        <div className="card source-card">
          <div className="source-icon bank">
            <Building2 size={24} />
          </div>
          <div className="source-info">
            <h4>Ngân hàng / Chuyển khoản</h4>
            <span className="source-amount text-primary">{bankTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <button className="btn-icon"><ArrowUpRight size={20} /></button>
        </div>
      </div>

      <div className="transactions-history card mt-2">
        <h3 className="card-title">Lịch sử giao dịch gần đây</h3>
        {paidOrders.length === 0 ? (
          <p className="text-muted text-center py-2">Chưa có giao dịch phát sinh</p>
        ) : (
          <div className="transaction-list">
            {paidOrders.slice().reverse().map(order => (
              <div key={order.id} className="transaction-item">
                <div className="tx-icon">
                  <ArrowDownRight size={20} className="text-success" />
                </div>
                <div className="tx-details">
                  <span className="tx-title">Thu tiền đơn hàng #{order.id.slice(0,6).toUpperCase()}</span>
                  <span className="tx-time">{new Date(order.createdAt).toLocaleString('vi-VN')} - {order.paymentMethod}</span>
                </div>
                <div className="tx-amount text-success">
                  +{order.total.toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
