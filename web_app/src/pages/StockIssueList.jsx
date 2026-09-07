import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockIssueService } from '../services/stockIssueService';
import { useToast } from '../context/ToastContext';
import { Plus, Package, Search } from 'lucide-react';
import './StockReceiptList.css'; // Reusing the same CSS to maintain visual consistency

export default function StockIssueList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredIssues = issues.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return i.code?.toLowerCase().includes(q) || i.note?.toLowerCase().includes(q);
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

      {/* Tabs + Search */}
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
        <div className="sr-search">
          <Search size={16} className="sr-search-icon" />
          <input
            type="text"
            placeholder="Tìm mã phiếu, ghi chú..."
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
    </div>
  );
}
