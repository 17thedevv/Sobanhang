import { useState, useEffect } from 'react';
import { X, DollarSign, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import MoneyInput from './MoneyInput';
import { formatMoneyVND } from '../utils/moneyUtils';

export default function PaymentModal({ isOpen, onClose, activeDebts, preSelectedDebt, customerId, onSuccess }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    cashSourceId: '',
    parentId: preSelectedDebt?.id || (activeDebts.length === 1 ? activeDebts[0].id : ''),
    note: '',
    attachments: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchSources();
    }
  }, [isOpen]);

  const fetchSources = async () => {
    try {
      const res = await axios.get('/api/cashbook/sources');
      setSources(res.data.sources);
      if (res.data.sources.length > 0) {
        setFormData(prev => ({ ...prev, cashSourceId: res.data.sources[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedDebtObj = activeDebts.find(d => d.id === formData.parentId);

  // Auto-fill amount when a debt is selected
  useEffect(() => {
    if (selectedDebtObj) {
      setFormData(prev => ({ ...prev, amount: selectedDebtObj.balance.toString() }));
    }
  }, [selectedDebtObj]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.parentId) {
      toast.warning('Vui lòng chọn khoản nợ để thanh toán');
      return;
    }
    
    const amountNum = parseFloat(formData.amount);
    if (!amountNum || amountNum <= 0) {
      toast.warning('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (amountNum > selectedDebtObj.balance) {
      toast.warning('Số tiền thanh toán không được lớn hơn dư nợ hiện tại');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/debt/transactions', {
        customerId,
        direction: selectedDebtObj.direction, // Same direction as parent
        amount: amountNum,
        cashSourceId: formData.cashSourceId || null,
        note: formData.note,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
        type: 'PAYMENT',
        parentId: formData.parentId
      });
      toast.success('Thanh toán thành công!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 500, width: '90%' }}>
        <div className="modal-header d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Thanh toán nợ</h4>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Select Debt (US-72 logic) */}
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Chọn khoản nợ</label>
            <select 
              className="form-control"
              value={formData.parentId}
              onChange={e => setFormData({...formData, parentId: e.target.value})}
              required
            >
              <option value="">-- Chọn khoản nợ --</option>
              {activeDebts.map(d => (
                <option key={d.id} value={d.id}>
                  {new Date(d.transactionDate).toLocaleDateString('vi-VN')} - {d.direction === 'GAVE' ? 'Phải thu' : 'Phải trả'} {formatMoneyVND(d.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase d-flex justify-content-between">
              <span>Số tiền thanh toán</span>
              {selectedDebtObj && (
                <span className="text-primary cursor-pointer" onClick={() => setFormData({...formData, amount: selectedDebtObj.balance})}>
                  Trả toàn bộ
                </span>
              )}
            </label>
            <div className="d-flex align-items-center gap-2">
              <DollarSign size={18} className="text-muted" />
              <MoneyInput
                value={formData.amount}
                onChange={val => setFormData({...formData, amount: val})}
                className="form-control fs-5 fw-bold text-primary"
                placeholder="0"
                showWords={true}
                required
              />
              <span className="text-muted fw-bold">đ</span>
            </div>
            {selectedDebtObj && formData.amount > 0 && formData.amount < selectedDebtObj.balance && (
              <div className="text-muted small mt-1">
                Còn lại sau thanh toán: {formatMoneyVND(selectedDebtObj.balance - formData.amount)}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Nguồn tiền</label>
            <select 
              className="form-control"
              value={formData.cashSourceId}
              onChange={e => setFormData({...formData, cashSourceId: e.target.value})}
            >
              <option value="">Không ghi nhận vào quỹ</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Ghi chú (Tùy chọn)</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Ghi chú thanh toán..."
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Đính kèm chứng từ</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {formData.attachments.map((url, idx) => (
                <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: 64, height: 64 }}>
                  <img src={url} alt="đính kèm" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    className="btn-close btn-close-white position-absolute top-0 end-0 bg-danger m-1 p-1"
                    style={{ fontSize: 10 }}
                    onClick={() => {
                      const newAtt = [...formData.attachments];
                      newAtt.splice(idx, 1);
                      setFormData({...formData, attachments: newAtt});
                    }}
                  ></button>
                </div>
              ))}
              <button 
                type="button" 
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64 }}
                onClick={() => {
                  const fakeUrl = `https://picsum.photos/seed/${Math.random()}/200/300`;
                  setFormData({...formData, attachments: [...formData.attachments, fakeUrl]});
                }}
              >
                <ImageIcon size={24} className="text-muted" />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </form>
      </div>
    </div>
  );
}
