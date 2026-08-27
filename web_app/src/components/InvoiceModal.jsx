import { X, CheckCircle2, Printer, Share2 } from 'lucide-react';
import './InvoiceModal.css';

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay glass" onClick={onClose}>
      <div className="modal-content invoice-card" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="invoice-header text-center">
          <CheckCircle2 size={56} className="text-success" style={{ margin: '0 auto 1rem' }} />
          <h2>
            {order.paymentStatus === 'PAID' ? 'HÓA ĐƠN BÁN HÀNG' : 
             order.paymentStatus === 'UNPAID' ? 'HÓA ĐƠN TẠM TÍNH' : 
             'HÓA ĐƠN GHI NỢ'}
          </h2>
          <p className="text-muted">Mã đơn: #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="invoice-body">
          <div className="invoice-total">
            <h3>{order.total.toLocaleString('vi-VN')}đ</h3>
          </div>
          
          <div className="invoice-details">
            <div className="detail-row">
              <span className="text-muted">Khách hàng</span>
              <span className="font-medium">{order.customer ? order.customer.name : 'Khách lẻ'}</span>
            </div>
            <div className="detail-row">
              <span className="text-muted">Trạng thái</span>
              <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-success' : 'text-warning'}`}>
                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                 order.paymentStatus === 'DEBT' ? 'Ghi nợ' : 'Chưa thanh toán'}
              </span>
            </div>
            {order.paymentStatus === 'PAID' && order.paymentSource && (
              <div className="detail-row">
                <span className="text-muted">Nguồn tiền</span>
                <span className="font-medium">
                  {order.paymentSource === 'CASH' ? 'Tiền mặt' : 
                   order.paymentSource === 'BANK' ? 'Chuyển khoản' : order.paymentSource}
                </span>
              </div>
            )}
            {(order.discount > 0 || order.shippingFee > 0) && (
              <>
                <div className="detail-row">
                  <span className="text-muted">Giảm giá</span>
                  <span className="font-medium text-danger">-{order.discount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted">Vận chuyển</span>
                  <span className="font-medium">+{order.shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
              </>
            )}
            <div className="detail-row">
              <span className="text-muted">Thời gian</span>
              <span className="font-medium">{new Date(order.createdAt || new Date()).toLocaleString('vi-VN')}</span>
            </div>
          </div>

          <div className="invoice-items">
            <h4>Chi tiết ({order.items.length} món)</h4>
            {order.items.map(item => (
              <div key={item.id || item.productId} className="detail-row">
                <span>{item.productNameSnapshot || item.product?.name} x{item.quantity}</span>
                <span>{((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
          </div>
        </div>

        <div className="invoice-actions">
          <button className="action-btn" onClick={() => window.print()}>
            <div className="icon-circle"><Printer size={20} /></div>
            <span>In hóa đơn</span>
          </button>
          <button className="action-btn">
            <div className="icon-circle"><Share2 size={20} /></div>
            <span>Chia sẻ</span>
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn-primary w-100" onClick={onClose} style={{width: '100%'}}>
            TẠO ĐƠN MỚI
          </button>
        </div>
      </div>
    </div>
  );
}
