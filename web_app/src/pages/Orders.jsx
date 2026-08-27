import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, DollarSign, Search, ChevronRight, X, Copy, Check, Share2 } from 'lucide-react';
import { useResponsive } from '../hooks/useMediaQuery';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Independent Payment Modal
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [sources, setSources] = useState([]);
  const [collectData, setCollectData] = useState({ amount: '', cashSourceId: '', description: '' });

  const { isMobile } = useResponsive();

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await axios.get('/api/cashbook/sources');
      setSources(res.data.sources);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSources();
  }, []);

  const getStatusBadge = (orderStatus, paymentStatus) => {
    if (orderStatus === 'CANCELLED') return <span className="badge badge-danger">Đã hủy</span>;
    if (paymentStatus === 'DEBT') return <span className="badge badge-warning">Ghi nợ</span>;
    if (paymentStatus === 'UNPAID') return <span className="badge badge-secondary">Chưa thanh toán</span>;
    return <span className="badge badge-success">Đã thanh toán</span>;
  };

  const handleExportCSV = () => {
    const headers = ['Mã ĐH', 'Khách hàng', 'Ngày tạo', 'Trạng thái', 'Tổng tiền'];
    const rows = orders.map(o => [
      o.id.split('-')[0].toUpperCase(),
      o.customer?.name || 'Khách lẻ',
      new Date(o.createdAt).toLocaleString('vi-VN'),
      o.orderStatus === 'CANCELLED' ? 'Đã hủy' : (o.paymentStatus === 'DEBT' ? 'Ghi nợ' : 'Hoàn thành'),
      o.total
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + "\n"
      + rows.map(e => e.join(',')).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `don_hang_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/cashbook/collect', {
        cashSourceId: collectData.cashSourceId,
        amount: collectData.amount,
        description: collectData.description
      });
      alert(`Đã thu ${collectData.amount}đ thành công!`);
      setShowCollectModal(false);
      setCollectData({ amount: '', cashSourceId: '', description: '' });
      fetchSources();
    } catch (err) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handlePayOrder = async (orderId, sourceId) => {
    if (!sourceId) return alert('Vui lòng chọn nguồn tiền');
    try {
      await axios.put(`/api/orders/${orderId}/collect-payment`, { cashSourceId: sourceId });
      alert('Thu tiền thành công!');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi thu tiền');
    }
  };

  const handleShare = async () => {
    if (!selectedOrder) return;
    const shareText = `Hóa đơn mua hàng\nMã: ${selectedOrder.id.split('-')[0].toUpperCase()}\nTổng tiền: ${selectedOrder.total.toLocaleString()}đ`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hóa đơn',
          text: shareText
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Đã copy thông tin hóa đơn');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer?.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container orders-page">
      <header className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Sổ Đơn hàng</h1>
          <p className="page-subtitle">Quản lý hóa đơn và thu nợ</p>
        </div>
        <div className="header-actions d-flex align-items-center gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={handleExportCSV}>
            <Download size={16} /> <span className="d-none d-sm-inline ms-1">Xuất Excel</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCollectModal(true)}>
            <DollarSign size={16} /> <span className="d-none d-sm-inline ms-1">Thu tiền</span>
          </button>
        </div>
      </header>

      <div className="search-bar mb-3">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm theo mã đơn, tên hoặc số điện thoại khách hàng..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-control"
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải đơn hàng...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state card text-center py-5">
          <FileText size={48} className="text-muted mb-3 mx-auto" />
          <h4>Chưa có đơn hàng nào</h4>
          <p className="text-muted">Tạo đơn hàng đầu tiên của bạn ngay.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="card order-card" onClick={() => setSelectedOrder(order)}>
              <div className="order-header">
                <span className="order-id">#{order.id.split('-')[0].toUpperCase()}</span>
                {getStatusBadge(order.orderStatus, order.paymentStatus)}
              </div>
              <div className="order-body">
                <div className="customer-info">
                  <strong>{order.customer?.name || 'Khách lẻ'}</strong>
                  <div className="text-muted small">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <div className="order-total">
                  {order.total.toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-detail-modal">
            <div className="modal-header">
              <h2>Chi tiết Hóa đơn</h2>
              <button className="btn-close" data-tooltip="Đóng" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body p-0">
              <div className="p-3 border-bottom">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Mã ĐH</span>
                  <strong>#{selectedOrder.id.split('-')[0].toUpperCase()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Ngày tạo</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Khách hàng</span>
                  <span>{selectedOrder.customer?.name || 'Khách lẻ'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Trạng thái</span>
                  {getStatusBadge(selectedOrder.orderStatus, selectedOrder.paymentStatus)}
                </div>
              </div>

              <div className="p-3 border-bottom bg-light">
                <h5 className="mb-3">Sản phẩm</h5>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <div>
                      <div>{item.productNameSnapshot}</div>
                      <div className="text-muted small">{item.quantity} x {item.unitPrice.toLocaleString()}đ</div>
                    </div>
                    <strong>{item.subtotal.toLocaleString()}đ</strong>
                  </div>
                ))}
              </div>

              <div className="p-3 border-bottom">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tạm tính</span>
                  <span>{selectedOrder.items.reduce((s, i) => s + i.subtotal, 0).toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Giảm giá</span>
                  <span>-{selectedOrder.discount.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phí giao hàng</span>
                  <span>+{selectedOrder.shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                  <strong>Tổng cộng</strong>
                  <strong className="text-primary fs-5">{selectedOrder.total.toLocaleString()}đ</strong>
                </div>
              </div>
            </div>
            
            <div className="modal-footer d-flex gap-2 p-3 bg-white">
              <button className="btn btn-outline-primary flex-grow-1" onClick={handleShare}>
                <Share2 size={18} className="me-1" /> Chia sẻ
              </button>
              
              {(selectedOrder.paymentStatus === 'DEBT' || selectedOrder.paymentStatus === 'UNPAID') && selectedOrder.orderStatus !== 'CANCELLED' && (
                <div className="d-flex gap-2 flex-grow-1">
                  <select 
                    className="form-control" 
                    id="collectSource"
                    defaultValue=""
                  >
                    <option value="" disabled>Chọn nguồn thu</option>
                    {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button 
                    className="btn btn-success text-white" 
                    onClick={() => {
                      const sel = document.getElementById('collectSource');
                      handlePayOrder(selectedOrder.id, sel.value);
                    }}
                  >
                    Thu nợ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INDEPENDENT COLLECT MODAL */}
      {showCollectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Thu Tiền (Độc lập)</h2>
              <button className="btn-close" data-tooltip="Đóng" onClick={() => setShowCollectModal(false)}>×</button>
            </div>
            <form onSubmit={handleCollectPayment} className="modal-body">
              <div className="form-group mb-3">
                <label>Số tiền</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  value={collectData.amount} 
                  onChange={e => setCollectData({...collectData, amount: e.target.value})}
                />
              </div>
              <div className="form-group mb-3">
                <label>Nguồn tiền nhận</label>
                <select 
                  className="form-control" 
                  required
                  value={collectData.cashSourceId} 
                  onChange={e => setCollectData({...collectData, cashSourceId: e.target.value})}
                >
                  <option value="">-- Chọn nguồn --</option>
                  {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-4">
                <label>Lý do (Tùy chọn)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Thu tiền nợ cũ, Thu ngoài..."
                  value={collectData.description} 
                  onChange={e => setCollectData({...collectData, description: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Ghi nhận Thu</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
