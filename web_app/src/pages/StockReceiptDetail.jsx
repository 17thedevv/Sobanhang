import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stockReceiptService } from '../services/stockReceiptService';
import { formatMoneyVND } from '../utils/moneyUtils';
import { useToast } from '../context/ToastContext';
import MoneyInput from '../components/MoneyInput';
import { ArrowLeft, Building2, Package, Trash2, X, AlertTriangle } from 'lucide-react';
import './StockReceiptList.css'; // Reuse badge styles if needed, but we'll inline some detail styles

export default function StockReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For pay debt or confirm
  const [showPayment, setShowPayment] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  // For delete confirm modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const data = await stockReceiptService.getReceiptById(id);
      setReceipt(data.receipt);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải phiếu nhập');
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

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await stockReceiptService.confirmReceipt(id, { paidAmount: 0 }); // simplest version: confirm without paying
      toast.success('Đã xác nhận nhập kho');
      fetchReceipt();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi xác nhận');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await stockReceiptService.payReceiptDebt(id, { amount: paidAmount });
      toast.success('Thanh toán thành công');
      setShowPayment(false);
      fetchReceipt();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await stockReceiptService.deleteReceipt(id);
      toast.success('Đã xoá phiếu nhập');
      navigate('/dashboard/stock-receipts');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi xoá phiếu');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="srf-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="sr-loading-spinner" style={{ marginBottom: 12 }}></div>
      <div style={{ color: '#666' }}>Đang tải chi tiết phiếu...</div>
    </div>
  );
  
  if (!receipt) return (
    <div className="srf-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Package size={48} color="#ccc" style={{ marginBottom: 16 }} />
      <h3 style={{ color: '#666' }}>Không tìm thấy phiếu nhập</h3>
      <button className="srf-btn srf-btn--secondary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
        Quay lại
      </button>
    </div>
  );

  return (
    <div className="srf-page">
      <div className="srf-header">
        <button className="srf-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="srf-title">Chi tiết phiếu nhập {receipt.code}</h2>
      </div>

      <div className="srf-body" style={{ flexDirection: 'column', maxWidth: '800px', margin: '0 auto', gap: 16 }}>
        
        {/* Info Card */}
        <div className="srf-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                {receipt.code}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                {new Date(receipt.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
            <div>
              {getStatusBadge(receipt.status)}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#444', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Building2 size={18} color="#00B14F" />
            <span style={{ fontWeight: 500 }}>Nhà cung cấp:</span>
            <span>{receipt.supplier?.name || 'Khách lẻ'}</span>
          </div>
          
          {receipt.note && (
            <div style={{ marginTop: 12, color: '#666', fontSize: '0.95rem' }}>
              <strong>Ghi chú:</strong> {receipt.note}
            </div>
          )}
        </div>

        {/* Products Card */}
        <div className="srf-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: '#fafafa', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' }}>
            Sản phẩm ({receipt.items?.length || 0})
          </div>
          <div style={{ padding: '0 20px' }}>
            {receipt.items?.map((item, index) => (
              <div key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '16px 0',
                borderBottom: index < receipt.items.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>
                    {item.product?.name || 'Sản phẩm không xác định'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {item.quantity} x {formatMoneyVND(item.importPrice)}
                  </div>
                </div>
                <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                  {formatMoneyVND(item.subTotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="srf-card" style={{ padding: '24px' }}>
          <div className="srf-summary-row">
            <span>Tổng tiền hàng:</span>
            <span style={{ fontWeight: 500 }}>{formatMoneyVND(receipt.totalAmount)}</span>
          </div>
          <div className="srf-summary-row">
            <span>Giảm giá:</span>
            <span>- {formatMoneyVND(receipt.discount)}</span>
          </div>
          <div className="srf-summary-row">
            <span>Phí phát sinh:</span>
            <span>+ {formatMoneyVND(receipt.shippingFee)}</span>
          </div>
          
          <div className="srf-summary-total" style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
            <span>Tổng cộng:</span>
            <span style={{ color: '#00B14F' }}>{formatMoneyVND(receipt.finalAmount)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: '1rem', color: '#555' }}>
            <span>Đã thanh toán:</span>
            <span style={{ color: '#2e7d32', fontWeight: 600 }}>{formatMoneyVND(receipt.paidAmount)}</span>
          </div>
          
          {receipt.finalAmount > receipt.paidAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: '1.05rem', color: '#d32f2f', fontWeight: 'bold' }}>
              <span>Còn nợ:</span>
              <span>{formatMoneyVND(receipt.finalAmount - receipt.paidAmount)}</span>
            </div>
          )}
        </div>
        
        {/* Padding for bottom bar */}
        <div style={{ height: 80 }}></div>
      </div>

      <div className="srf-bottom-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        {receipt.status === 'DRAFT' && (
          <>
            <button 
              className="srf-btn" 
              style={{ flex: 1, background: '#fee2e2', color: '#b91c1c' }} 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
            >
              <Trash2 size={18} />
              Huỷ phiếu
            </button>
            <button 
              className="srf-btn srf-btn--primary" 
              style={{ flex: 2 }} 
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận nhập kho'}
            </button>
          </>
        )}
        
        {receipt.finalAmount > receipt.paidAmount && receipt.status !== 'DRAFT' && receipt.status !== 'CANCELLED' && (
          <button 
            className="srf-btn srf-btn--primary" 
            style={{ width: '100%' }} 
            onClick={() => setShowPayment(true)}
          >
            Thanh toán nợ
          </button>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="srf-payment-overlay">
          <div className="srf-payment-modal" style={{ maxWidth: 450 }}>
            <div className="srf-payment-header">
              <h3>Thanh toán nợ</h3>
              <button className="srf-back-btn" onClick={() => setShowPayment(false)} style={{ width: 32, height: 32 }}>
                <X size={18} />
              </button>
            </div>
            
            <div className="srf-payment-body">
              <div className="srf-form-group">
                <label className="srf-form-label">Số tiền thanh toán</label>
                <MoneyInput 
                  value={paidAmount}
                  onChange={setPaidAmount}
                  className="srf-input"
                />
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                  Còn nợ tối đa: <strong>{formatMoneyVND(receipt.finalAmount - receipt.paidAmount)}</strong>
                </div>
              </div>

              <button 
                className="srf-btn srf-btn--primary" 
                style={{ width: '100%', marginTop: '24px' }} 
                onClick={handlePay}
                disabled={isProcessing || paidAmount <= 0 || paidAmount > (receipt.finalAmount - receipt.paidAmount)}
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="srf-payment-overlay">
          <div className="srf-payment-modal" style={{ maxWidth: 400, textAlign: 'center', padding: '24px' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#dc2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <AlertTriangle size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 12px', fontSize: '1.25rem', color: '#1a1a2e' }}>Huỷ phiếu nhập?</h3>
            <p style={{ color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
              Phiếu <strong>{receipt.code}</strong> sẽ bị xoá vĩnh viễn và không thể khôi phục. 
              Tồn kho của bạn sẽ không bị ảnh hưởng.
            </p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="srf-btn srf-btn--secondary" 
                style={{ flex: 1 }} 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                Trở lại
              </button>
              <button 
                className="srf-btn" 
                style={{ flex: 1, background: '#dc2626', color: 'white' }} 
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang xoá...' : 'Đồng ý Huỷ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
