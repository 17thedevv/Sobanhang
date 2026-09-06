import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockReceiptService } from '../services/stockReceiptService';
import { formatMoneyVND } from '../utils/moneyUtils';
import { useToast } from '../context/ToastContext';
import { Plus, Package, Search, ArrowLeft } from 'lucide-react';
import './StockReceiptList.css';

export default function StockReceiptList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredReceipts = receipts.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return r.code?.toLowerCase().includes(q) || r.supplier?.name?.toLowerCase().includes(q);
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

      {/* Tabs + Search */}
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
        <div className="sr-search">
          <Search size={16} className="sr-search-icon" />
          <input
            type="text"
            placeholder="Tìm mã phiếu, nhà cung cấp..."
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
    </div>
  );
}
