import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Filter, Download, DollarSign, BookOpen, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Orders.css'; // Reuse CSS from Orders if possible, or create Debt.css

export default function DebtLedger() {
  const [summary, setSummary] = useState({ totalReceivables: 0, totalPayables: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();

  const fetchDebtData = async () => {
    try {
      const [summaryRes, customersRes] = await Promise.all([
        axios.get('/api/debt/summary'),
        axios.get('/api/debt/customers')
      ]);
      setSummary(summaryRes.data);
      setCustomers(customersRes.data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtData();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.customer?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.customer?.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container debt-page">
      <header className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title">Sổ Nợ</h1>
          <p className="page-subtitle">Quản lý Phải thu và Phải trả</p>
        </div>
        <div className="header-actions d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <Filter size={16} /> <span className="d-none d-sm-inline ms-1">Bộ lọc</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/debt/new')}>
            <Plus size={16} /> <span className="d-none d-sm-inline ms-1">Ghi nợ</span>
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-6 col-md-6">
          <div className="card p-3 border-success text-success h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="text-uppercase small fw-bold mb-1">Tôi phải thu</div>
            <h3 className="mb-0">{summary.totalReceivables.toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>
        <div className="col-6 col-md-6">
          <div className="card p-3 border-danger text-danger h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: '#fef2f2' }}>
            <div className="text-uppercase small fw-bold mb-1">Tôi phải trả</div>
            <h3 className="mb-0">{summary.totalPayables.toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>
      </div>

      <div className="search-bar mb-3">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm tên, số điện thoại khách hàng..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-control"
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải danh sách...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="empty-state card text-center py-5">
          <BookOpen size={48} className="text-muted mb-3 mx-auto" />
          <h4>Chưa có công nợ nào</h4>
          <p className="text-muted">Nhấn "Ghi nợ" để tạo giao dịch nợ đầu tiên.</p>
        </div>
      ) : (
        <div className="customers-list">
          {filteredCustomers.map(data => {
            const netDebt = data.totalReceivables - data.totalPayables;
            const isReceivable = netDebt > 0;
            const isPayable = netDebt < 0;
            
            return (
              <div 
                key={data.customer.id} 
                className="card d-flex flex-row align-items-center p-3 mb-2" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/debt/customer/${data.customer.id}`)}
              >
                <div className="avatar me-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: 48, height: 48}}>
                  <User size={24} className="text-muted" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold fs-6">{data.customer.name}</div>
                  <div className="text-muted small">{data.customer.phone || 'Chưa có SĐT'}</div>
                </div>
                <div className="text-end me-3">
                  {isReceivable && (
                    <>
                      <div className="text-success small fw-bold">Phải thu</div>
                      <div className="text-success fw-bold">{Math.abs(netDebt).toLocaleString('vi-VN')}đ</div>
                    </>
                  )}
                  {isPayable && (
                    <>
                      <div className="text-danger small fw-bold">Phải trả</div>
                      <div className="text-danger fw-bold">{Math.abs(netDebt).toLocaleString('vi-VN')}đ</div>
                    </>
                  )}
                  {netDebt === 0 && (
                    <>
                      <div className="text-muted small fw-bold">Đã thanh toán</div>
                      <div className="text-muted fw-bold">0đ</div>
                    </>
                  )}
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
