import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function DebtReminders() {
  const navigate = useNavigate();
  const toast = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, OVERDUE, TODAY, UPCOMING

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await axios.get('/api/debt/reminders');
      setReminders(res.data.reminders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/debt/reminders/${id}/status`, { status });
      fetchReminders();
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const getCategorized = () => {
    const todayReminders = [];
    const overdueReminders = [];
    const upcomingReminders = [];

    reminders.forEach(r => {
      const rDateStr = new Date(r.reminderDate).toISOString().split('T')[0];
      if (rDateStr < todayStr) overdueReminders.push(r);
      else if (rDateStr === todayStr) todayReminders.push(r);
      else upcomingReminders.push(r);
    });

    return {
      TODAY: todayReminders,
      OVERDUE: overdueReminders,
      UPCOMING: upcomingReminders,
      ALL: reminders
    };
  };

  const categories = getCategorized();
  const displayReminders = categories[activeTab];

  const handleSendZalo = (reminder) => {
    // Construct Zalo deep link with a pre-filled message
    // Note: Zalo doesn't officially support pre-filled text in deep links easily without OA API, 
    // but a common format is zci:// or zalo:// (Mocking this)
    const message = `Chào ${reminder.customer.name}, phiền bạn kiểm tra lại công nợ hiện tại nhé!`;
    const phone = reminder.customer.phone || '';
    if (phone) {
      const url = `https://zalo.me/${phone}`;
      window.open(url, '_blank');
      handleUpdateStatus(reminder.id, 'SENT');
    } else {
      toast.warning('Khách hàng này chưa có số điện thoại.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <header className="page-header d-flex align-items-center mb-4">
        <button className="btn-icon me-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title mb-0">Lịch nhắc nợ</h1>
      </header>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 nav-fill bg-white p-1 rounded border shadow-sm">
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'ALL' ? 'active' : 'text-muted'}`} onClick={() => setActiveTab('ALL')}>
            Tất cả ({categories.ALL.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'OVERDUE' ? 'active bg-danger' : 'text-muted'}`} onClick={() => setActiveTab('OVERDUE')}>
            Quá hạn ({categories.OVERDUE.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'TODAY' ? 'active bg-warning text-dark' : 'text-muted'}`} onClick={() => setActiveTab('TODAY')}>
            Hôm nay ({categories.TODAY.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'UPCOMING' ? 'active bg-info' : 'text-muted'}`} onClick={() => setActiveTab('UPCOMING')}>
            Sắp tới ({categories.UPCOMING.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5 text-muted">Đang tải...</div>
      ) : displayReminders.length === 0 ? (
        <div className="card text-center py-5">
          <Clock size={48} className="text-muted mx-auto mb-3" />
          <h5>Không có lịch nhắc nợ nào</h5>
        </div>
      ) : (
        <div className="reminders-list">
          {displayReminders.map(r => {
            const isOverdue = new Date(r.reminderDate).toISOString().split('T')[0] < todayStr;
            const isToday = new Date(r.reminderDate).toISOString().split('T')[0] === todayStr;
            const statusBadge = r.status === 'SENT' ? (
              <span className="badge bg-success"><CheckCircle size={12} className="me-1"/> Đã gửi</span>
            ) : r.status === 'PENDING' ? (
              <span className="badge bg-secondary">Chờ gửi</span>
            ) : (
              <span className="badge bg-danger">Trễ</span>
            );

            return (
              <div key={r.id} className="card p-3 mb-3 border-start border-4" style={{ borderLeftColor: isOverdue ? '#dc3545' : isToday ? '#ffc107' : '#0dcaf0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{r.customer.name}</h5>
                    <div className="text-muted small mb-2 d-flex align-items-center">
                      <Clock size={14} className="me-1" />
                      Ngày nhắc: <strong>{new Date(r.reminderDate).toLocaleDateString('vi-VN')}</strong>
                      <span className="mx-2">|</span>
                      {statusBadge}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-success btn-sm d-flex align-items-center" onClick={() => handleSendZalo(r)}>
                      <Send size={16} className="me-1" /> Zalo
                    </button>
                    {r.status !== 'SENT' && (
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => handleUpdateStatus(r.id, 'SENT')}>
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
