import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stockLedgerService } from '../services/stockLedgerService';
import { useToast } from '../context/ToastContext';
import { Package, Search, Filter } from 'lucide-react';
import './StockReceiptList.css'; // Reusing CSS

export default function StockLedger() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load products for filter
    axios.get('/api/products')
      .then(res => setProducts(res.data.products || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedProductId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      if (selectedProductId === 'ALL') {
        const data = await stockLedgerService.getLedgerTransactions();
        setTransactions(data.transactions || []);
      } else {
        const data = await stockLedgerService.getProductLedger(selectedProductId);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải thẻ kho');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeBadge = (type) => {
    const badges = {
      RECEIPT: { label: 'Nhập kho', color: '#10b981', bg: '#d1fae5' }, // Green
      ISSUE: { label: 'Xuất kho', color: '#f59e0b', bg: '#fef3c7' },   // Yellow
      CHECK: { label: 'Kiểm kho', color: '#6366f1', bg: '#e0e7ff' },   // Indigo
      SALE: { label: 'Bán hàng', color: '#ef4444', bg: '#fee2e2' },    // Red
      RETURN: { label: 'Trả hàng', color: '#3b82f6', bg: '#dbeafe' },  // Blue
    };
    const badge = badges[type] || { label: type, color: '#6b7280', bg: '#f3f4f6' };
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        padding: '2px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: 500,
        color: badge.color,
        backgroundColor: badge.bg
      }}>
        {badge.label}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.referenceCode?.toLowerCase().includes(q) || 
           t.product?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-page-header">
        <div className="sr-header-left">
          <h1 className="sr-title">Thẻ kho (Sổ kho)</h1>
          <span className="sr-count">{transactions.length} giao dịch</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sr-toolbar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: 'white',
            flex: 1
          }}>
            <Filter size={16} color="#9ca3af" style={{ marginRight: '8px' }} />
            <select 
              value={selectedProductId} 
              onChange={e => setSelectedProductId(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#111827', fontSize: '14px' }}
            >
              <option value="ALL">Tất cả sản phẩm</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sr-search" style={{ flex: 1, minWidth: '250px' }}>
          <Search size={16} className="sr-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã chứng từ, tên sản phẩm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="sr-content">
        {loading ? (
          <div className="sr-loading">
            <div className="sr-loading-spinner"></div>
            <span>Đang tải dữ liệu thẻ kho...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <Package size={48} strokeWidth={1.2} />
            </div>
            <h3>Không có giao dịch kho nào</h3>
            <p>Các giao dịch nhập, xuất, bán hàng sẽ được ghi nhận tại đây.</p>
          </div>
        ) : (
          <div className="sr-list">
            {/* Table Header */}
            <div className="sr-table-header" style={{ gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr 1fr' }}>
              <span className="sr-col">Thời gian</span>
              <span className="sr-col">Sản phẩm</span>
              <span className="sr-col">Loại / Mã CT</span>
              <span className="sr-col" style={{ textAlign: 'right' }}>SL Thay đổi</span>
              <span className="sr-col" style={{ textAlign: 'right' }}>Tồn sau GD</span>
              <span className="sr-col">Ghi chú</span>
            </div>

            {/* Transaction Rows */}
            {filteredTransactions.map(tx => {
              const qtyChange = tx.quantityChange;
              const isPositive = qtyChange > 0;
              const qtyColor = isPositive ? '#10b981' : (qtyChange < 0 ? '#ef4444' : '#6b7280');
              const qtySign = isPositive ? '+' : '';

              return (
                <div key={tx.id} className="sr-card" style={{ gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr 1fr', cursor: 'default' }}>
                  <span className="sr-col">
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </span>
                  <span className="sr-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tx.product?.image ? (
                          <img src={tx.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <Package size={16} color="#9ca3af" />
                        )}
                      </div>
                      <span style={{ fontWeight: 500, color: '#111827' }}>{tx.product?.name || 'Sản phẩm đã xoá'}</span>
                    </div>
                  </span>
                  <span className="sr-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    {getTransactionTypeBadge(tx.type)}
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{tx.referenceCode}</span>
                  </span>
                  <span className="sr-col" style={{ textAlign: 'right', fontWeight: 600, color: qtyColor, fontSize: '15px' }}>
                    {qtySign}{qtyChange}
                  </span>
                  <span className="sr-col" style={{ textAlign: 'right', fontWeight: 500, color: '#374151' }}>
                    {tx.balanceAfter}
                  </span>
                  <span className="sr-col" style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.note || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
