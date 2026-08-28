import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import axios from 'axios';

export default function CustomerSelectModal({ isOpen, onClose, onSelect }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers');
      setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 500, width: '90%' }}>
        <div className="modal-header d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Chọn khách hàng</h4>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="search-bar mb-3">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, số điện thoại..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control"
            autoFocus
          />
        </div>

        <div className="customer-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-4 text-muted">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted">Không tìm thấy khách hàng nào</div>
          ) : (
            filtered.map(c => (
              <div 
                key={c.id} 
                className="d-flex justify-content-between align-items-center p-3 border-bottom"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect(c)}
              >
                <div>
                  <div className="fw-bold">{c.name}</div>
                  <div className="text-muted small">{c.phone || 'Chưa có SĐT'}</div>
                </div>
                <button className="btn btn-sm btn-outline-primary rounded-circle" style={{ width: 32, height: 32, padding: 0 }}>
                  <Check size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="modal-footer mt-3 pt-3 border-top">
          {/* Mockup for create new customer button */}
          <button className="btn btn-outline-primary w-100 text-center" onClick={() => alert('Tính năng thêm khách hàng mới đang phát triển')}>
            + Tạo khách hàng mới
          </button>
        </div>
      </div>
    </div>
  );
}
