import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function ReminderModal({ isOpen, onClose, customerId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [reminderDate, setReminderDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reminderDate) {
      toast.warning('Vui lòng chọn ngày nhắc');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/debt/reminders', {
        customerId,
        reminderDate
      });
      toast.success('Đặt lịch nhắc nợ thành công!');
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
      <div className="modal-content" style={{ maxWidth: 400, width: '90%' }}>
        <div className="modal-header d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Đặt lịch nhắc nợ</h4>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Ngày nhắc</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><Calendar size={18} className="text-muted" /></span>
              <input 
                type="date" 
                className="form-control"
                value={reminderDate}
                onChange={e => setReminderDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates (QTN-23)
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu lịch nhắc'}
          </button>
        </form>
      </div>
    </div>
  );
}
