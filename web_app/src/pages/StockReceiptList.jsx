import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockReceiptService } from '../services/stockReceiptService';
import { formatMoneyVND } from '../utils/moneyUtils';
import { useToast } from '../context/ToastContext';
import { Plus, Package, Search, ArrowLeft, Filter, X, RotateCcw, Calendar } from 'lucide-react';
import './StockReceiptList.css';

export default function StockReceiptList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // US-94: Filters State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterSupplierId, setFilterSupplierId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchReceipts();
  }, [activeTab]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : {};
      const data = await stockReceiptService.getReceipts(params);
      setReceipts(data.receipts || []);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { label: 'Chờ xác nhận', className: 'sr-badge--pending' },
      PARTIAL_PAID: { label: 'Nợ một phần', className: 'sr-badge--partial' },
      COMPLETED: { label: 'Hoàn thành', className: 'sr-badge--success' },
      CANCELLED: { label: 'Đã huỷ', className: 'sr-badge--error' },
    };
    const badge = badges[status];
    if (!badge) return null;
    return <span className={`sr-badge ${badge.className}`}>{badge.label}</span>;
  };

  const uniqueSuppliers = Array.from(
    new Map(
      receipts
        .filter(r => r.supplier)
        .map(r => [r.supplier.id, r.supplier])
    ).values()
  );

  const activeFilterCount = [
    filterDateRange !== 'ALL',
    filterSupplierId !== 'ALL',
    filterStatus !== 'ALL',
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilterDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setFilterSupplierId('ALL');
    setFilterStatus('ALL');
  };

  const filteredReceipts = receipts.filter(r => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = r.code?.toLowerCase().includes(q) || r.supplier?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Status filter
    if (filterStatus !== 'ALL' && r.status !== filterStatus) {
      return false;
    }
    // Supplier filter
    if (filterSupplierId !== 'ALL' && r.supplierId !== filterSupplierId) {
      return false;
    }
    // Date range filter
    if (filterDateRange !== 'ALL') {
      const rDate = new Date(r.createdAt);
      const now = new Date();
      if (filterDateRange === 'TODAY') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (rDate < todayStart) return false;
      } else if (filterDateRange === 'WEEK') {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (rDate < weekStart) return false;
      } else if (filterDateRange === 'MONTH') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (rDate < monthStart) return false;
      } else if (filterDateRange === 'CUSTOM') {
        if (customStartDate && rDate < new Date(customStartDate)) return false;
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (rDate > end) return false;
        }
      }
    }
    return true;
  });

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-page-header">
        <div className="sr-header-left">
          <h1 className="sr-title">Sổ nhập hàng</h1>
          <span className="sr-count">{receipts.length} phiếu</span>
        </div>
        <button className="sr-btn-create" onClick={() => navigate('/dashboard/stock-receipts/new')}>
          <Plus size={18} />
          <span>Tạo phiếu nhập</span>
        </button>
      </div>

      {/* Tabs + Search + Filter */}
      <div className="sr-toolbar">
        <div className="sr-tabs">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'DRAFT', label: 'Chờ xác nhận' },
            { key: 'COMPLETED', label: 'Hoàn thành' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`sr-tab ${activeTab === tab.key ? 'sr-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="sr-search">
            <Search size={16} className="sr-search-icon" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, nhà cung cấp..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

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

          {activeFilterCount > 0 && (
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
      </div>

      {/* Content */}
      <div className="sr-content">
        {loading ? (
          <div className="sr-loading">
            <div className="sr-loading-spinner"></div>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <Package size={48} strokeWidth={1.2} />
            </div>
            <h3>Chưa có phiếu nhập hàng nào</h3>
            <p>Nhấn "Tạo phiếu nhập" để bắt đầu nhập hàng từ nhà cung cấp</p>
            <button className="sr-btn-create" onClick={() => navigate('/dashboard/stock-receipts/new')}>
              <Plus size={18} />
              <span>Tạo phiếu nhập đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="sr-list">
            {/* Table Header */}
            <div className="sr-table-header">
              <span className="sr-col sr-col--code">Mã phiếu</span>
              <span className="sr-col sr-col--supplier">Nhà cung cấp</span>
              <span className="sr-col sr-col--date">Ngày tạo</span>
              <span className="sr-col sr-col--total">Tổng tiền</span>
              <span className="sr-col sr-col--paid">Đã trả</span>
              <span className="sr-col sr-col--items">Sản phẩm</span>
              <span className="sr-col sr-col--status">Trạng thái</span>
            </div>

            {/* Receipt Cards / Rows */}
            {filteredReceipts.map(receipt => (
              <div
                key={receipt.id}
                className="sr-card"
                onClick={() => navigate(`/dashboard/stock-receipts/${receipt.id}`)}
              >
                <span className="sr-col sr-col--code">
                  <strong>{receipt.code}</strong>
                </span>
                <span className="sr-col sr-col--supplier">
                  {receipt.supplier?.name || 'Không có NCC'}
                </span>
                <span className="sr-col sr-col--date">
                  {new Date(receipt.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="sr-col sr-col--total">
                  {formatMoneyVND(receipt.finalAmount)}
                </span>
                <span className="sr-col sr-col--paid sr-text-success">
                  {formatMoneyVND(receipt.paidAmount)}
                </span>
                <span className="sr-col sr-col--items">
                  {receipt.items?.length || 0}
                </span>
                <span className="sr-col sr-col--status">
                  {getStatusBadge(receipt.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* US-94: Filter Modal */}
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
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Bộ lọc phiếu nhập hàng</h4>
              </div>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Time Filter */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 8 }}>
                Thời gian tạo
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

            {/* Status Filter */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 8 }}>
                Trạng thái phiếu
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'DRAFT', label: 'Chờ xác nhận' },
                  { key: 'PARTIAL_PAID', label: 'Nợ một phần' },
                  { key: 'COMPLETED', label: 'Hoàn thành' },
                  { key: 'CANCELLED', label: 'Đã huỷ' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilterStatus(item.key)}
                    style={{
                      padding: '0.45rem 0.8rem', borderRadius: 8,
                      border: filterStatus === item.key ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                      background: filterStatus === item.key ? '#e6f7ec' : '#fff',
                      color: filterStatus === item.key ? '#00B14F' : '#555',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Supplier Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 6 }}>
                Nhà cung cấp
              </label>
              <select
                value={filterSupplierId}
                onChange={e => setFilterSupplierId(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  border: '1px solid #e0e0e0', borderRadius: 8,
                  fontSize: '0.9rem', backgroundColor: '#fafafa', outline: 'none'
                }}
              >
                <option value="ALL">Tất cả nhà cung cấp</option>
                {uniqueSuppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
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
