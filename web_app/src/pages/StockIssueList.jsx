import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockIssueService } from '../services/stockIssueService';
import { useToast } from '../context/ToastContext';
import { Plus, Package, Search, Filter, X, RotateCcw } from 'lucide-react';
import './StockReceiptList.css'; // Reusing the same CSS to maintain visual consistency

export default function StockIssueList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // US-111: Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchIssues();
  }, [activeTab]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : {};
      const data = await stockIssueService.getIssues(params);
      setIssues(data.issues || []);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách phiếu xuất');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { label: 'Nháp', className: 'sr-badge--pending' },
      COMPLETED: { label: 'Đã xuất', className: 'sr-badge--success' },
      CANCELLED: { label: 'Đã huỷ', className: 'sr-badge--error' },
    };
    const badge = badges[status];
    if (!badge) return null;
    return <span className={`sr-badge ${badge.className}`}>{badge.label}</span>;
  };

  const activeFilterCount = [
    filterDateRange !== 'ALL',
    filterStatus !== 'ALL',
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilterDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setFilterStatus('ALL');
  };

  const filteredIssues = issues.filter(i => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = i.code?.toLowerCase().includes(q) || i.note?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Status filter
    if (filterStatus !== 'ALL' && i.status !== filterStatus) {
      return false;
    }
    // Date range filter
    if (filterDateRange !== 'ALL') {
      const iDate = new Date(i.createdAt);
      const now = new Date();
      if (filterDateRange === 'TODAY') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (iDate < todayStart) return false;
      } else if (filterDateRange === 'WEEK') {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (iDate < weekStart) return false;
      } else if (filterDateRange === 'MONTH') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (iDate < monthStart) return false;
      } else if (filterDateRange === 'CUSTOM') {
        if (customStartDate && iDate < new Date(customStartDate)) return false;
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (iDate > end) return false;
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
          <h1 className="sr-title">Sổ xuất hàng</h1>
          <span className="sr-count">{issues.length} phiếu</span>
        </div>
        <button className="sr-btn-create" onClick={() => navigate('/dashboard/stock-issues/new')}>
          <Plus size={18} />
          <span>Tạo phiếu xuất</span>
        </button>
      </div>

      {/* Tabs + Search + Filter */}
      <div className="sr-toolbar">
        <div className="sr-tabs">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'DRAFT', label: 'Nháp' },
            { key: 'COMPLETED', label: 'Đã xuất' },
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
              placeholder="Tìm mã phiếu, ghi chú..."
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
        ) : filteredIssues.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <Package size={48} strokeWidth={1.2} />
            </div>
            <h3>Chưa có phiếu xuất hàng nào</h3>
            <p>Nhấn "Tạo phiếu xuất" để bắt đầu xuất hàng</p>
            <button className="sr-btn-create" onClick={() => navigate('/dashboard/stock-issues/new')}>
              <Plus size={18} />
              <span>Tạo phiếu xuất đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="sr-list">
            {/* Table Header */}
            <div className="sr-table-header">
              <span className="sr-col sr-col--code">Mã phiếu</span>
              <span className="sr-col sr-col--date">Ngày tạo</span>
              <span className="sr-col sr-col--items">Sản phẩm</span>
              <span className="sr-col sr-col--supplier">Ghi chú</span>
              <span className="sr-col sr-col--status">Trạng thái</span>
            </div>

            {/* Issue Cards / Rows */}
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="sr-card"
                onClick={() => navigate(`/dashboard/stock-issues/${issue.id}`)}
              >
                <span className="sr-col sr-col--code">
                  <strong>{issue.code}</strong>
                </span>
                <span className="sr-col sr-col--date">
                  {new Date(issue.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="sr-col sr-col--items">
                  {issue.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} mục
                </span>
                <span className="sr-col sr-col--supplier">
                  {issue.note || 'Không có ghi chú'}
                </span>
                <span className="sr-col sr-col--status">
                  {getStatusBadge(issue.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* US-111: Filter Modal */}
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
              width: '90%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', zIndex: 1050,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f7ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B14F' }}>
                  <Filter size={18} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Bộ lọc phiếu xuất hàng</h4>
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
                Thời gian xuất
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 8 }}>
                Trạng thái phiếu
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'DRAFT', label: 'Nháp' },
                  { key: 'COMPLETED', label: 'Đã xuất' },
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
