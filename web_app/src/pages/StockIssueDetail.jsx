import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stockIssueService } from '../services/stockIssueService';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Package, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import './StockReceiptList.css'; // Reusing CSS

export default function StockIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const data = await stockIssueService.getIssueById(id);
      setIssue(data.issue);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải phiếu xuất');
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

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await stockIssueService.updateIssueStatus(id, 'COMPLETED');
      toast.success('Đã xác nhận xuất kho');
      fetchIssue();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi xác nhận');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    const confirm = window.confirm('Bạn có chắc chắn muốn huỷ phiếu xuất này?');
    if (!confirm) return;

    setIsProcessing(true);
    try {
      await stockIssueService.updateIssueStatus(id, 'CANCELLED');
      toast.success('Đã huỷ phiếu xuất');
      fetchIssue();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi huỷ phiếu');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="sr-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="sr-loading-spinner" style={{ marginBottom: 12 }}></div>
      <div style={{ color: '#666' }}>Đang tải chi tiết phiếu...</div>
    </div>
  );

  if (!issue) return (
    <div className="sr-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#666' }}>Không tìm thấy phiếu xuất</div>
      <button className="sr-btn-back" onClick={() => navigate('/dashboard/stock-issues')} style={{ marginTop: 16 }}>
        Quay lại
      </button>
    </div>
  );

  return (
    <div className="sr-page">
      <div className="sr-page-header">
        <div className="sr-header-left">
          <button className="sr-btn-back" onClick={() => navigate('/dashboard/stock-issues')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="sr-title">Chi tiết phiếu xuất</h1>
          {getStatusBadge(issue.status)}
        </div>
        
        {issue.status === 'DRAFT' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="sr-btn-secondary" 
              onClick={handleCancel}
              disabled={isProcessing}
              style={{ color: '#ef4444', borderColor: '#ef4444' }}
            >
              <Trash2 size={18} style={{ marginRight: 6 }} />
              Huỷ phiếu
            </button>
            <button 
              className="sr-btn-create" 
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              <CheckCircle size={18} style={{ marginRight: 6 }} />
              Xác nhận xuất kho
            </button>
          </div>
        )}
      </div>

      <div className="sr-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        {/* Cột trái: Chi tiết sản phẩm */}
        <div className="sr-panel" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="#6366f1" />
            Sản phẩm xuất ({issue.items?.length || 0})
          </h3>
          
          <div className="sr-table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
            <span>Tên sản phẩm</span>
            <span style={{ textAlign: 'right' }}>Số lượng</span>
            <span style={{ textAlign: 'right' }}>Tồn kho lúc xuất</span>
          </div>

          <div style={{ marginTop: '12px' }}>
            {issue.items?.map((item) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 12px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.product?.image ? (
                      <img src={item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <Package size={20} color="#9ca3af" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{item.product?.name || 'Sản phẩm đã xoá'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#111827' }}>
                  {item.quantity} {item.product?.unit}
                </div>
                <div style={{ textAlign: 'right', color: '#6b7280' }}>
                  {item.product?.stock ?? '-'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Thông tin tổng quan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="sr-panel" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Thông tin chung
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Mã phiếu:</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{issue.code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Ngày tạo:</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>
                  {new Date(issue.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Cập nhật:</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>
                  {new Date(issue.updatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '8px' }}>Ghi chú:</label>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0, whiteSpace: 'pre-line' }}>
                {issue.note || 'Không có ghi chú'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
