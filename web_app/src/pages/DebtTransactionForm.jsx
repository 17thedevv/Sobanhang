import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, UserPlus, FileText, Calendar, DollarSign, Edit3, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerSelectModal from '../components/CustomerSelectModal';
import { useToast } from '../context/ToastContext';
import MoneyInput from '../components/MoneyInput';

export default function DebtTransactionForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [sources, setSources] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer: null,
    direction: 'GAVE', // "GAVE" = Tôi đã đưa (Phải thu), "RECEIVED" = Tôi đã nhận (Phải trả)
    amount: '',
    cashSourceId: '',
    transactionDate: new Date().toISOString().substring(0, 10),
    note: '',
    attachments: []
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await axios.get('/api/cashbook/sources');
      setSources(res.data.sources);
      // Default to first source if available
      if (res.data.sources.length > 0) {
        setFormData(prev => ({ ...prev, cashSourceId: res.data.sources[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer) {
      toast.warning('Vui lòng chọn khách hàng');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.warning('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/debt/transactions', {
        customerId: formData.customer.id,
        direction: formData.direction,
        amount: parseFloat(formData.amount),
        cashSourceId: formData.cashSourceId || null,
        transactionDate: formData.transactionDate,
        note: formData.note,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined
      });
      toast.success('Ghi giao dịch nợ thành công!');
      navigate('/dashboard/debt');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
      <header className="page-header d-flex align-items-center mb-4">
        <button className="btn-icon me-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title mb-0">Ghi giao dịch nợ</h1>
      </header>

      <form onSubmit={handleSubmit}>
        {/* Toggle Direction */}
        <div className="d-flex bg-light rounded p-1 mb-4">
          <button 
            type="button"
            className={`btn flex-grow-1 ${formData.direction === 'GAVE' ? 'btn-success text-white' : 'btn-light text-muted'}`}
            onClick={() => setFormData({...formData, direction: 'GAVE'})}
          >
            Khách nợ tôi
          </button>
          <button 
            type="button"
            className={`btn flex-grow-1 ${formData.direction === 'RECEIVED' ? 'btn-danger text-white' : 'btn-light text-muted'}`}
            onClick={() => setFormData({...formData, direction: 'RECEIVED'})}
          >
            Tôi nợ khách
          </button>
        </div>

        {/* Customer Select */}
        <div className="card p-3 mb-3" style={{ cursor: 'pointer' }} onClick={() => setShowCustomerModal(true)}>
          {formData.customer ? (
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-bold">{formData.customer.name}</div>
                <div className="text-muted small">{formData.customer.phone || 'Chưa có SĐT'}</div>
              </div>
              <Edit3 size={18} className="text-muted" />
            </div>
          ) : (
            <div className="d-flex align-items-center text-primary justify-content-center py-2">
              <UserPlus size={18} className="me-2" />
              <span className="fw-bold">Chọn khách hàng</span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="card p-3 mb-3">
          <label className="form-label text-muted small fw-bold text-uppercase">Số tiền</label>
          <div className="d-flex align-items-center gap-2">
            <DollarSign size={18} className="text-muted" />
            <MoneyInput
              value={formData.amount}
              onChange={val => setFormData({...formData, amount: val})}
              className="form-control fs-4 fw-bold"
              placeholder="0"
              showWords={true}
              required
            />
            <span className="text-muted fw-bold">đ</span>
          </div>
        </div>

        {/* Details */}
        <div className="card p-3 mb-4">
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
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Ngày giao dịch</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><Calendar size={18} className="text-muted" /></span>
              <input 
                type="date" 
                className="form-control"
                value={formData.transactionDate}
                onChange={e => setFormData({...formData, transactionDate: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="form-label text-muted small fw-bold">Ghi chú</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><FileText size={18} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control"
                placeholder="Nhập ghi chú..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-3">
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
            <div className="small text-muted">Hỗ trợ tải ảnh hóa đơn, biên lai (Mock)</div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2 fs-5 fw-bold" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu giao dịch'}
        </button>
      </form>

      <CustomerSelectModal 
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelect={(c) => {
          setFormData({...formData, customer: c});
          setShowCustomerModal(false);
        }}
      />
    </div>
  );
}
