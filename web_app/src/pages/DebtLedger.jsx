import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Filter, Download, DollarSign, BookOpen, User, ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Orders.css'; // Reuse CSS from Orders if possible, or create Debt.css

export default function DebtLedger() {
  const toast = useToast();
  const [summary, setSummary] = useState({ totalReceivables: 0, totalPayables: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, RECEIVABLE, PAYABLE, SETTLED
  const [sortMode, setSortMode] = useState('AMOUNT_DESC'); // AMOUNT_DESC, AMOUNT_ASC, NAME_ASC
  
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

  let processedCustomers = customers.map(c => {
    const netDebt = c.totalReceivables - c.totalPayables;
    return { ...c, netDebt };
  });

  // Filter
  if (filterMode === 'RECEIVABLE') {
    processedCustomers = processedCustomers.filter(c => c.netDebt > 0);
  } else if (filterMode === 'PAYABLE') {
    processedCustomers = processedCustomers.filter(c => c.netDebt < 0);
  } else if (filterMode === 'SETTLED') {
    processedCustomers = processedCustomers.filter(c => c.netDebt === 0);
  }

  // Search
  processedCustomers = processedCustomers.filter(c => 
    c.customer?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.customer?.phone?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  processedCustomers.sort((a, b) => {
    if (sortMode === 'NAME_ASC') {
      return a.customer.name.localeCompare(b.customer.name);
    } else if (sortMode === 'AMOUNT_DESC') {
      return Math.abs(b.netDebt) - Math.abs(a.netDebt);
    } else if (sortMode === 'AMOUNT_ASC') {
      return Math.abs(a.netDebt) - Math.abs(b.netDebt);
    }
    return 0;
  });

  const handleExportCSV = () => {
    if (processedCustomers.length === 0) {
      toast.warning('Không có dữ liệu để xuất');
      return;
    }

    const headers = ['Tên khách hàng', 'Số điện thoại', 'Tổng phải thu', 'Tổng phải trả', 'Dư nợ'];
    const rows = processedCustomers.map(c => [
      c.customer.name,
      c.customer.phone || '',
      c.totalReceivables,
      c.totalPayables,
      c.netDebt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `so_no_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container debt-page">
      <header className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title">Sổ Nợ</h1>
          <p className="page-subtitle">Quản lý Phải thu và Phải trả</p>
        </div>
        <div className="header-actions d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/dashboard/debt/reminders')}>
            <Bell size={16} /> <span className="d-none d-sm-inline ms-1">Nhắc nợ</span>
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={16} /> <span className="d-none d-sm-inline ms-1">Xuất file</span>
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: '1 1 250px', minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#aaa' }} />
          <input 
            type="text" 
            placeholder="Tìm tên, số điện thoại khách hàng..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              border: '1px solid #e0e0e0',
              borderRadius: 10,
              fontSize: '0.9rem',
              backgroundColor: '#fafafa',
              outline: 'none',
            }}
          />
        </div>
        <select 
          value={filterMode}
          onChange={e => setFilterMode(e.target.value)}
          style={{
            padding: '0.65rem 2rem 0.65rem 0.85rem',
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            fontSize: '0.9rem',
            backgroundColor: '#fafafa',
            minWidth: 150,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'auto',
          }}
        >
          <option value="ALL">Tất cả nợ</option>
          <option value="RECEIVABLE">Phải thu</option>
          <option value="PAYABLE">Phải trả</option>
          <option value="SETTLED">Đã tất toán</option>
        </select>
        <select 
          value={sortMode}
          onChange={e => setSortMode(e.target.value)}
          style={{
            padding: '0.65rem 2rem 0.65rem 0.85rem',
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            fontSize: '0.9rem',
            backgroundColor: '#fafafa',
            minWidth: 170,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'auto',
          }}
        >
          <option value="AMOUNT_DESC">Dư nợ giảm dần</option>
          <option value="AMOUNT_ASC">Dư nợ tăng dần</option>
          <option value="NAME_ASC">Tên A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải danh sách...</div>
      ) : processedCustomers.length === 0 ? (
        <div className="empty-state card text-center py-5">
          <BookOpen size={48} className="text-muted mb-3 mx-auto" />
          <h4>Chưa có công nợ nào phù hợp</h4>
          <p className="text-muted">Thử thay đổi bộ lọc hoặc thêm giao dịch mới.</p>
        </div>
      ) : (
        <div className="customers-list">
          {processedCustomers.map(data => {
            const { netDebt } = data;
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
