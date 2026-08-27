import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ArrowUpRight, ArrowDownRight, Building2, Wallet, Plus, ArrowRightLeft } from 'lucide-react';
import './CashFlow.css';

export default function CashFlow() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form states
  const [newSource, setNewSource] = useState({ name: '', type: 'CASH', balance: 0, createdAt: new Date().toISOString().split('T')[0] });
  const [transfer, setTransfer] = useState({ fromSourceId: '', toSourceId: '', amount: 0, description: '' });
  const [error, setError] = useState('');

  const fetchSources = async () => {
    try {
      const res = await axios.get('/api/cashbook/sources');
      setSources(res.data.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const totalFund = sources.reduce((sum, s) => sum + s.balance, 0);

  const handleCreateSource = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/cashbook/sources', newSource);
      setShowCreateModal(false);
      setNewSource({ name: '', type: 'CASH', balance: 0, createdAt: new Date().toISOString().split('T')[0] });
      fetchSources();
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi tạo nguồn tiền');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/cashbook/transfer', transfer);
      setShowTransferModal(false);
      setTransfer({ fromSourceId: '', toSourceId: '', amount: 0, description: '' });
      fetchSources();
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi chuyển tiền');
    }
  };

  // Drag and drop sorting
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newSources = [...sources];
    const draggedSource = newSources[draggedItem];
    newSources.splice(draggedItem, 1);
    newSources.splice(index, 0, draggedSource);
    
    setDraggedItem(index);
    setSources(newSources);
  };

  const handleDragEnd = async () => {
    setDraggedItem(null);
    // Send updated order to backend
    const orderMapping = {};
    sources.forEach((s, index) => {
      orderMapping[s.id] = index;
    });
    try {
      await axios.put('/api/cashbook/sources/order', { orderMapping });
    } catch (err) {
      console.error('Failed to update order', err);
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải sổ quỹ...</div>;

  return (
    <div className="page-container cashflow-page">
      <header className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Quản lý Nguồn tiền</h1>
          <p className="page-subtitle">Quản lý sổ quỹ, chuyển tiền</p>
        </div>
      </header>

      <div className="fund-summary-card card bg-primary-gradient text-white">
        <div className="fund-header">
          <span>Tổng quỹ hiện tại</span>
          <Wallet size={24} />
        </div>
        <h2 className="fund-total">{totalFund.toLocaleString('vi-VN')}đ</h2>
      </div>

      <div className="section-header d-flex justify-content-between align-items-center mt-3">
        <h3 className="section-title mb-0">Danh sách nguồn tiền</h3>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Thêm
        </button>
      </div>
      
      <div className="fund-sources mt-2">
        {sources.length === 0 ? (
          <p className="text-muted text-center py-4 card">Chưa có nguồn tiền nào.</p>
        ) : (
          sources.map((source, index) => (
            <div 
              key={source.id} 
              className="card source-card draggable-source"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={`source-icon ${source.type.toLowerCase()}`}>
                {source.type === 'CASH' ? <DollarSign size={24} /> : <Building2 size={24} />}
              </div>
              <div className="source-info flex-grow-1">
                <h4>{source.name}</h4>
                <span className="source-amount text-success">{source.balance.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="drag-handle text-muted" style={{cursor: 'grab'}}>
                =
              </div>
            </div>
          ))
        )}
      </div>

      <div className="d-flex justify-content-center mt-3">
        <button 
          className="btn btn-outline-primary d-flex align-items-center gap-2 w-100 justify-content-center py-2"
          onClick={() => setShowTransferModal(true)}
          disabled={sources.length < 2}
        >
          <ArrowRightLeft size={20} /> Chuyển tiền giữa các nguồn
        </button>
      </div>

      {/* CREATE SOURCE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Thêm Nguồn tiền</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSource} className="modal-body">
              {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}
              
              <div className="form-group mb-3">
                <label>Loại nguồn tiền</label>
                <select 
                  className="form-control" 
                  value={newSource.type} 
                  onChange={e => setNewSource({...newSource, type: e.target.value})}
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK">Tài khoản Ngân hàng</option>
                  <option value="EWALLET">Ví điện tử</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Tên nguồn tiền</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="VD: Két tiền quầy, Vietcombank..."
                  value={newSource.name} 
                  onChange={e => setNewSource({...newSource, name: e.target.value})}
                />
              </div>

              <div className="form-group mb-3">
                <label>Số dư ban đầu</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newSource.balance} 
                  onChange={e => setNewSource({...newSource, balance: Number(e.target.value)})}
                />
              </div>

              <div className="form-group mb-4">
                <label>Ngày ghi nhận</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newSource.createdAt} 
                  onChange={e => setNewSource({...newSource, createdAt: e.target.value})}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">Hoàn tất</button>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chuyển tiền nội bộ</h2>
              <button className="btn-close" onClick={() => setShowTransferModal(false)}>×</button>
            </div>
            <form onSubmit={handleTransfer} className="modal-body">
              {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}
              
              <div className="form-group mb-3">
                <label>Nguồn tiền gửi</label>
                <select 
                  className="form-control" 
                  required
                  value={transfer.fromSourceId} 
                  onChange={e => setTransfer({...transfer, fromSourceId: e.target.value})}
                >
                  <option value="">-- Chọn nguồn --</option>
                  {sources.map(s => <option key={s.id} value={s.id}>{s.name} (Số dư: {s.balance.toLocaleString()}đ)</option>)}
                </select>
              </div>

              <div className="d-flex justify-content-center my-2 text-muted">
                <ArrowDownRight size={24} />
              </div>

              <div className="form-group mb-3">
                <label>Nguồn tiền nhận</label>
                <select 
                  className="form-control" 
                  required
                  value={transfer.toSourceId} 
                  onChange={e => setTransfer({...transfer, toSourceId: e.target.value})}
                >
                  <option value="">-- Chọn nguồn --</option>
                  {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Số tiền chuyển</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="1"
                  value={transfer.amount || ''} 
                  onChange={e => setTransfer({...transfer, amount: Number(e.target.value)})}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-2">Xác nhận chuyển</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
