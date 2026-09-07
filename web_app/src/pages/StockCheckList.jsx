import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockCheckService } from '../services/stockCheckService';
import { useToast } from '../context/ToastContext';
import { Plus, Package, Search } from 'lucide-react';
import './StockReceiptList.css'; // Reusing the same CSS to maintain visual consistency

export default function StockCheckList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChecks();
  }, [activeTab]);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : {};
      const data = await stockCheckService.getChecks(params);
      setChecks(data.checks || []);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách phiếu kiểm kho');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { label: 'Đang kiểm', className: 'sr-badge--pending' },
      BALANCED: { label: 'Đã cân bằng', className: 'sr-badge--success' },
      CANCELLED: { label: 'Đã huỷ', className: 'sr-badge--error' },
    };
    const badge = badges[status];
    if (!badge) return null;
    return <span className={`sr-badge ${badge.className}`}>{badge.label}</span>;
  };

  const filteredChecks = checks.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.code?.toLowerCase().includes(q) || c.note?.toLowerCase().includes(q);
  });

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-page-header">
        <div className="sr-header-left">
          <h1 className="sr-title">Sổ kiểm kho</h1>
          <span className="sr-count">{checks.length} phiếu</span>
        </div>
        <button className="sr-btn-create" onClick={() => navigate('/dashboard/stock-checks/new')}>
          <Plus size={18} />
          <span>Tạo phiếu kiểm kho</span>
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="sr-toolbar">
        <div className="sr-tabs">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'DRAFT', label: 'Đang kiểm' },
            { key: 'BALANCED', label: 'Đã cân bằng' },
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
        ) : filteredChecks.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <Package size={48} strokeWidth={1.2} />
            </div>
            <h3>Chưa có phiếu kiểm kho nào</h3>
            <p>Nhấn "Tạo phiếu kiểm kho" để bắt đầu kiểm tra số lượng tồn kho thực tế</p>
            <button className="sr-btn-create" onClick={() => navigate('/dashboard/stock-checks/new')}>
              <Plus size={18} />
              <span>Tạo phiếu kiểm kho đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="sr-list">
            {/* Table Header */}
            <div className="sr-table-header">
              <span className="sr-col sr-col--code">Mã phiếu</span>
              <span className="sr-col sr-col--date">Ngày tạo</span>
              <span className="sr-col sr-col--items">Sản phẩm kiểm</span>
              <span className="sr-col sr-col--supplier">Ghi chú</span>
              <span className="sr-col sr-col--status">Trạng thái</span>
            </div>

            {/* Check Cards / Rows */}
            {filteredChecks.map(check => (
              <div
                key={check.id}
                className="sr-card"
                onClick={() => navigate(`/dashboard/stock-checks/${check.id}`)}
              >
                <span className="sr-col sr-col--code">
                  <strong>{check.code}</strong>
                </span>
                <span className="sr-col sr-col--date">
                  {new Date(check.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="sr-col sr-col--items">
                  {check.items?.length || 0} mục
                </span>
                <span className="sr-col sr-col--supplier">
                  {check.note || 'Không có ghi chú'}
                </span>
                <span className="sr-col sr-col--status">
                  {getStatusBadge(check.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
