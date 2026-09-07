import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Edit, Trash2, Phone, MessageCircle, FileText, Plus, ShoppingCart, BookOpen, Tag, X, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  // US-83: Customer Tags State
  const [showTagModal, setShowTagModal] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/customers/${customerId}`);
      setCustomer(res.data.customer);
    } catch (err) {
      console.error(err);
      toast.error('Không tìm thấy khách hàng');
      navigate('/dashboard/customers');
    } finally {
      setLoading(false);
    }
  };

  const openTagModal = async () => {
    try {
      const res = await axios.get('/api/customers/tags/all');
      setAllTags(res.data.tags || []);
      setSelectedTagIds(customer.tags?.map(t => t.id) || []);
      setShowTagModal(true);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách nhãn');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await axios.post('/api/customers/tags/create', { name: newTagName.trim() });
      const created = res.data.tag;
      if (created) {
        setAllTags(prev => [...prev, created]);
        setSelectedTagIds(prev => [...prev, created.id]);
        setNewTagName('');
        toast.success('Đã tạo nhãn mới');
      }
    } catch (err) {
      toast.error('Lỗi tạo nhãn: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleTag = (tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSaveTags = async () => {
    try {
      setSavingTags(true);
      await axios.put(`/api/customers/${customerId}`, { tagIds: selectedTagIds });
      toast.success('Cập nhật nhãn thành công');
      setShowTagModal(false);
      fetchCustomer();
    } catch (err) {
      toast.error('Lỗi lưu nhãn');
    } finally {
      setSavingTags(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa khách hàng này?')) return;
    try {
      await axios.delete(`/api/customers/${customerId}`);
      navigate('/dashboard/customers');
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await axios.post(`/api/customers/${customerId}/notes`, { content: newNote });
      setNewNote('');
      fetchCustomer();
    } catch (err) {
      toast.error('Lỗi thêm ghi chú');
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (!customer) return null;

  const totalRevenue = customer.orders?.reduce((sum, o) => sum + o.total, 0) || 0;
  const totalOrders = customer.orders?.length || 0;

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <header className="page-header d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button className="btn-icon me-2" onClick={() => navigate('/dashboard/customers')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title mb-0">Hồ sơ khách hàng</h1>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(`/dashboard/customers/${customerId}/edit`)}>
            <Edit size={16} /> <span className="d-none d-sm-inline ms-1">Sửa</span>
          </button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="card p-3 mb-4 border-0 shadow-sm">
        <div className="d-flex align-items-center mb-3">
          <div className="avatar me-3 bg-light rounded-circle d-flex align-items-center justify-content-center overflow-hidden" style={{width: 64, height: 64}}>
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <span className="fs-3 fw-bold text-muted">{customer.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-grow-1">
            <h4 className="mb-1">{customer.name}</h4>
            <div className="text-muted small mb-1">{customer.phone || 'Chưa có SĐT'}</div>
            <div className="d-flex gap-1 flex-wrap align-items-center">
              {customer.groups?.map(g => <span key={g.id} className="badge bg-primary rounded-pill">{g.name}</span>)}
              {customer.tags?.map(t => <span key={t.id} className="badge bg-info text-dark rounded-pill">#{t.name}</span>)}
              <button
                className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill ms-1"
                style={{ fontSize: '0.78rem', height: 22, display: 'inline-flex', alignItems: 'center' }}
                onClick={openTagModal}
              >
                <Tag size={12} className="me-1" />
                {customer.tags?.length ? 'Sửa nhãn' : '+ Thêm nhãn'}
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 border-top pt-3">
          <a href={`tel:${customer.phone || ''}`} className="btn btn-outline-success flex-grow-1 d-flex justify-content-center align-items-center" onClick={(e) => !customer.phone && e.preventDefault()}>
            <Phone size={18} className="me-2" /> Gọi điện
          </a>
          <a href={`sms:${customer.phone || ''}`} className="btn btn-outline-primary flex-grow-1 d-flex justify-content-center align-items-center" onClick={(e) => !customer.phone && e.preventDefault()}>
            <MessageCircle size={18} className="me-2" /> Nhắn tin
          </a>
        </div>
      </div>

      {/* Shortcut actions */}
      <div className="row g-2 mb-4">
        <div className="col-6">
          <button className="btn btn-primary w-100 py-2 d-flex flex-column align-items-center" onClick={() => navigate('/dashboard/pos')}>
            <ShoppingCart size={24} className="mb-1" />
            <span>Tạo đơn hàng</span>
          </button>
        </div>
        <div className="col-6">
          <button className="btn btn-danger w-100 py-2 d-flex flex-column align-items-center" onClick={() => navigate('/dashboard/debt/new')}>
            <BookOpen size={24} className="mb-1" />
            <span>Ghi nợ</span>
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item flex-grow-1 text-center">
          <button className="nav-link w-100 fw-bold active text-primary">Tổng quan</button>
        </li>
      </ul>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="card p-3 text-center border-0 shadow-sm h-100">
            <div className="text-muted small mb-1">Tổng doanh thu</div>
            <div className="fs-4 fw-bold text-success">{totalRevenue.toLocaleString()} đ</div>
          </div>
        </div>
        <div className="col-6">
          <div className="card p-3 text-center border-0 shadow-sm h-100">
            <div className="text-muted small mb-1">Đơn hàng đã giao</div>
            <div className="fs-4 fw-bold text-primary">{totalOrders} đơn</div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <h5 className="mb-3">Đơn hàng gần đây</h5>
          {customer.orders?.length > 0 ? (
            <div className="list-group shadow-sm">
              {customer.orders.slice(0, 3).map(o => (
                <div key={o.id} className="list-group-item">
                  <div className="d-flex justify-content-between mb-1">
                    <strong>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</strong>
                    <span className="text-success fw-bold">{o.total.toLocaleString()} đ</span>
                  </div>
                  <div className="small text-muted">{o.items?.length} sản phẩm</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-3 text-center text-muted border-0 shadow-sm">Chưa có đơn hàng</div>
          )}
        </div>

        <div className="col-md-6 mb-4">
          <h5 className="mb-3">Ghi chú Timeline</h5>
          <div className="card p-3 border-0 shadow-sm mb-3">
            <div className="d-flex gap-2">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder="Thêm ghi chú mới..." 
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={!newNote.trim()}>Lưu</button>
            </div>
          </div>

          <div className="timeline ps-2 border-start border-2 border-primary ms-2">
            {customer.notes?.map(note => (
              <div key={note.id} className="position-relative mb-3 ps-3">
                <div className="position-absolute bg-primary rounded-circle" style={{width: 10, height: 10, left: -6, top: 6}}></div>
                <div className="small text-muted mb-1">{new Date(note.createdAt).toLocaleString('vi-VN')}</div>
                <div className="bg-light p-2 rounded small">{note.content}</div>
              </div>
            ))}
            {(!customer.notes || customer.notes.length === 0) && (
              <div className="text-muted small ps-3">Chưa có ghi chú nào</div>
            )}
          </div>
        </div>
      </div>

      {/* US-83: Tag Management Modal */}
      {showTagModal && (
        <>
          <div 
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1040, backdropFilter: 'blur(3px)',
            }} 
            onClick={() => setShowTagModal(false)} 
          />
          <div 
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'white', borderRadius: 16, padding: '1.75rem',
              width: '90%', maxWidth: 440, zIndex: 1050,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Tag size={18} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Quản lý nhãn khách hàng</h4>
              </div>
              <button 
                onClick={() => setShowTagModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick create tag */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#555', fontSize: '0.85rem', marginBottom: 6 }}>
                Tạo nhãn mới
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="VD: VIP, Mua sỉ, Khách quen..."
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
                  style={{
                    flex: 1, padding: '0.55rem 0.85rem', border: '1px solid #e0e0e0',
                    borderRadius: 8, fontSize: '0.9rem', outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="btn btn-outline-primary"
                  style={{ borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm
                </button>
              </div>
            </div>

            {/* Tag list to select */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#555', fontSize: '0.85rem', marginBottom: 8 }}>
                Chọn nhãn ({selectedTagIds.length} đã chọn)
              </label>
              {allTags.length === 0 ? (
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: 8, textAlign: 'center', color: '#888', fontSize: '0.88rem' }}>
                  Chưa có nhãn nào. Nhập tên ở trên để tạo nhãn đầu tiên!
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: 180, overflowY: 'auto', padding: 4 }}>
                  {allTags.map(tag => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '0.4rem 0.75rem',
                          borderRadius: 20,
                          border: isSelected ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                          background: isSelected ? '#e6f7ec' : '#f8f9fa',
                          color: isSelected ? '#00B14F' : '#444',
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && <Check size={14} />}
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-light flex-grow-1"
                onClick={() => setShowTagModal(false)}
                style={{ borderRadius: 8 }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary flex-grow-1"
                onClick={handleSaveTags}
                disabled={savingTags}
                style={{ borderRadius: 8 }}
              >
                {savingTags ? 'Đang lưu...' : 'Lưu nhãn'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
