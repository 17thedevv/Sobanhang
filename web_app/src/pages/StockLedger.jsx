import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stockLedgerService } from '../services/stockLedgerService';
import { useToast } from '../context/ToastContext';
import { Package, Search, Filter, PackagePlus, ClipboardCheck, PackageOpen, ArrowRight, Download, Wallet, TrendingUp, Layers, RotateCcw, X, Calendar } from 'lucide-react';
import { formatMoneyVND } from '../utils/moneyUtils';
import { exportToExcel } from '../utils/exportExcel';
import './StockReceiptList.css'; // Reusing CSS

export default function StockLedger() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // US-136: Filters state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  // US-133: Calculate total inventory value and statistics
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const totalStockCount = selectedProductId === 'ALL'
    ? products.reduce((sum, p) => sum + (p.stock || 0), 0)
    : (selectedProduct?.stock || 0);

  const totalStockValue = selectedProductId === 'ALL'
    ? products.reduce((sum, p) => sum + (p.stock || 0) * (p.costPrice || p.price || 0), 0)
    : (selectedProduct?.stock || 0) * (selectedProduct?.costPrice || selectedProduct?.price || 0);

  const activeFilterCount = [
    filterType !== 'ALL',
    filterDateRange !== 'ALL',
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilterType('ALL');
    setFilterDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const filteredTransactions = transactions.filter(t => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = t.referenceCode?.toLowerCase().includes(q) || 
                    t.product?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // 2. Transaction Type
    if (filterType !== 'ALL' && t.type !== filterType) {
      return false;
    }
    // 3. Date range
    if (filterDateRange !== 'ALL') {
      const tDate = new Date(t.createdAt);
      const now = new Date();
      if (filterDateRange === 'TODAY') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (tDate < todayStart) return false;
      } else if (filterDateRange === 'WEEK') {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (tDate < weekStart) return false;
      } else if (filterDateRange === 'MONTH') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (tDate < monthStart) return false;
      } else if (filterDateRange === 'CUSTOM') {
        if (customStartDate && tDate < new Date(customStartDate)) return false;
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (tDate > end) return false;
        }
      }
    }
    return true;
  });

  const handleExportExcel = () => {
    if (!transactions || transactions.length === 0) {
      toast.warning('Không có dữ liệu để xuất');
      return;
    }
    
    const data = filteredTransactions.map(t => ({
      'Ngày giao dịch': new Date(t.createdAt).toLocaleString('vi-VN'),
      'Mã tham chiếu': t.referenceCode,
      'Loại giao dịch': t.type,
      'Tên sản phẩm': t.product?.name || 'Sản phẩm không xác định',
      'Thay đổi': t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange,
      'Tồn sau GD': t.balanceAfter,
      'Ghi chú': t.note || ''
    }));
    
    exportToExcel(data, `So_Kho.xlsx`, 'SoKho');
    toast.success('Đã xuất báo cáo sổ kho');
  };

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-page-header">
        <div className="sr-header-left">
          <h1 className="sr-title">Thẻ kho (Sổ kho)</h1>
          <span className="sr-count">{transactions.length} giao dịch</span>
        </div>
        <button 
          className="sr-btn-secondary" 
          onClick={handleExportExcel}
          style={{ height: '36px', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 500, cursor: 'pointer' }}
        >
          <Download size={16} style={{ marginRight: 6 }} />
          Xuất Excel
        </button>
      </div>

      {/* US-133: Summary Cards - Tổng giá trị tồn kho */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Card 1: Tổng giá trị tồn kho */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          color: 'white',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.9 }}>
              {selectedProductId === 'ALL' ? 'Tổng giá trị tồn kho toàn tiệm' : 'Giá trị tồn mặt hàng này'}
            </span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 8 }}>
              <Wallet size={18} color="#fff" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {formatMoneyVND(totalStockValue)}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4 }}>
            Theo giá vốn / giá nhập hiện tại
          </div>
        </div>

        {/* Card 2: Tổng số lượng tồn */}
        <div style={{
          background: 'white',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>
              {selectedProductId === 'ALL' ? 'Tổng số lượng hàng tồn' : 'Số lượng tồn kho'}
            </span>
            <div style={{ background: '#ecfdf5', padding: 6, borderRadius: 8 }}>
              <Package size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#111827' }}>
            {totalStockCount.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6b7280' }}>sản phẩm</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 4 }}>
            {selectedProductId === 'ALL' ? `Phân bổ trên ${products.length} mặt hàng` : selectedProduct?.name}
          </div>
        </div>

        {/* Card 3: Mặt hàng lọc */}
        <div style={{
          background: 'white',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>
              Phạm vi theo dõi
            </span>
            <div style={{ background: '#eff6ff', padding: 6, borderRadius: 8 }}>
              <Layers size={18} color="#3b82f6" />
            </div>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedProductId === 'ALL' ? 'Tất cả sản phẩm' : (selectedProduct?.name || 'Sản phẩm')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>
            {selectedProductId === 'ALL' ? `Hiển thị thẻ kho toàn bộ kho` : `Giá nhập: ${formatMoneyVND(selectedProduct?.costPrice || selectedProduct?.price || 0)}`}
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Product Select + Filters */}
      <div className="sr-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Product Select */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: 'white',
          minWidth: '220px',
          flex: 1
        }}>
          <Filter size={16} color="#9ca3af" style={{ marginRight: '8px' }} />
          <select 
            value={selectedProductId} 
            onChange={e => setSelectedProductId(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#111827', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="ALL">Tất cả sản phẩm ({products.length})</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock})</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="sr-search" style={{ flex: 1, minWidth: '220px' }}>
          <Search size={16} className="sr-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã chứng từ, tên sản phẩm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* US-136: Filter Button */}
        <button
          onClick={() => setShowFilterModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: activeFilterCount > 0 ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
            background: activeFilterCount > 0 ? '#e6f7ec' : '#fff',
            color: activeFilterCount > 0 ? '#00B14F' : '#444',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            height: '38px',
          }}
        >
          <Filter size={16} />
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <span style={{
              background: '#00B14F',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: '0.72rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Reset Filter Button */}
        {(activeFilterCount > 0 || searchQuery) && (
          <button
            onClick={handleResetFilters}
            title="Đặt lại bộ lọc"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              background: '#fff5f5',
              color: '#ef4444',
              cursor: 'pointer',
              height: '38px',
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}
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

      {/* US-138: Quick Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '16px 24px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <button
          onClick={() => navigate('/dashboard/stock-issues/create')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #fbbf24',
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            color: '#92400e',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(251,191,36,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <PackageOpen size={18} />
          Xuất hàng
        </button>

        <button
          onClick={() => navigate('/dashboard/stock-checks/create')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #818cf8',
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            color: '#3730a3',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(129,140,248,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <ClipboardCheck size={18} />
          Kiểm kho
        </button>

        <button
          onClick={() => navigate('/dashboard/stock-receipts/create')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #34d399',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            color: '#065f46',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(52,211,153,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <PackagePlus size={18} />
          Nhập hàng
        </button>
      </div>
      {/* US-136: Filter Modal */}
      {showFilterModal && (
        <>
          <div 
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1040, backdropFilter: 'blur(3px)',
            }} 
            onClick={() => setShowFilterModal(false)} 
          />
          <div 
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'white', borderRadius: 16, padding: '1.75rem',
              width: '90%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', zIndex: 1050,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f7ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B14F' }}>
                  <Filter size={18} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Bộ lọc thẻ kho</h4>
              </div>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Transaction Type Filter */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 8 }}>
                Loại giao dịch
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'RECEIPT', label: 'Nhập kho' },
                  { key: 'ISSUE', label: 'Xuất kho' },
                  { key: 'CHECK', label: 'Kiểm kho' },
                  { key: 'SALE', label: 'Bán hàng' },
                  { key: 'RETURN', label: 'Trả hàng' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilterType(item.key)}
                    style={{
                      padding: '0.45rem 0.8rem', borderRadius: 8,
                      border: filterType === item.key ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                      background: filterType === item.key ? '#e6f7ec' : '#fff',
                      color: filterType === item.key ? '#00B14F' : '#555',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 8 }}>
                Thời gian giao dịch
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'TODAY', label: 'Hôm nay' },
                  { key: 'WEEK', label: '7 ngày qua' },
                  { key: 'MONTH', label: 'Tháng này' },
                  { key: 'CUSTOM', label: 'Tuỳ chỉnh' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilterDateRange(item.key)}
                    style={{
                      padding: '0.45rem 0.8rem', borderRadius: 8,
                      border: filterDateRange === item.key ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                      background: filterDateRange === item.key ? '#e6f7ec' : '#fff',
                      color: filterDateRange === item.key ? '#00B14F' : '#555',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {filterDateRange === 'CUSTOM' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#777' }}>Từ ngày:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={e => setCustomStartDate(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#777' }}>Đến ngày:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={e => setCustomEndDate(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleResetFilters}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: 10,
                  border: '1px solid #e0e0e0', background: '#f8f8f8',
                  fontWeight: 600, cursor: 'pointer', color: '#666',
                }}
              >
                Thiết lập lại
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: 10,
                  border: 'none', background: '#00B14F',
                  color: 'white', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 177, 79, 0.25)'
                }}
              >
                Áp dụng {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
