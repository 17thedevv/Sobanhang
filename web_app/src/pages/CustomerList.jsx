import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, User, Users, ChevronRight, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function CustomerList() {
  const [activeTab, setActiveTab] = useState('CUSTOMERS');
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (activeTab === 'CUSTOMERS') {
      fetchCustomers();
    } else {
      fetchGroups();
    }
  }, [activeTab, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers', { params: { search } });
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers/groups/all');
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await axios.post('/api/customers/groups/create', { name: newGroupName });
      setShowGroupModal(false);
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tạo nhóm: ' + (err.response?.data?.error || err.message));
    }
  };

  // Generate consistent color from name
  const getAvatarColor = (name) => {
    const colors = [
      { bg: '#e6f7ec', text: '#00B14F' },
      { bg: '#e8f4fd', text: '#1976d2' },
      { bg: '#fdecea', text: '#d32f2f' },
      { bg: '#fff8e1', text: '#f9a825' },
      { bg: '#f3e5f5', text: '#9c27b0' },
      { bg: '#e0f2f1', text: '#00897b' },
      { bg: '#fce4ec', text: '#e91e63' },
      { bg: '#e8eaf6', text: '#3f51b5' },
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem' }}>Khách hàng</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'CUSTOMERS' ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/customers/new')} style={{ borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={18} /> Tạo khách hàng
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowGroupModal(true)} style={{ borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={18} /> Tạo nhóm mới
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #eee', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('CUSTOMERS')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'CUSTOMERS' ? '#00B14F' : '#999',
            borderBottom: activeTab === 'CUSTOMERS' ? '2px solid #00B14F' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          Danh sách khách hàng
        </button>
        <button 
          onClick={() => setActiveTab('GROUPS')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'GROUPS' ? '#00B14F' : '#999',
            borderBottom: activeTab === 'GROUPS' ? '2px solid #00B14F' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          Nhóm khách hàng
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400, marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#aaa' }}/>
        <input 
          type="text" 
          style={{
            width: '100%',
            padding: '0.7rem 1rem 0.7rem 2.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            fontSize: '0.9rem',
            backgroundColor: '#fafafa',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          placeholder={activeTab === 'CUSTOMERS' ? "Tìm tên, số điện thoại..." : "Tìm tên nhóm..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = '#00B14F'}
          onBlur={e => e.target.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Đang tải...</div>
      ) : activeTab === 'CUSTOMERS' ? (
        customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <User size={56} style={{ color: '#ddd', marginBottom: 16 }} />
            <div style={{ color: '#999', fontSize: '1rem' }}>Chưa có khách hàng nào</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {customers.map(c => {
              const color = getAvatarColor(c.name);
              return (
                <div 
                  key={c.id}
                  onClick={() => navigate(`/dashboard/customers/${c.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#00B14F';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  {/* Avatar */}
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}/>
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: color.bg, color: color.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1.1rem',
                    }}>
                      {getInitials(c.name)}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: '0.82rem' }}>
                      <Phone size={13} />
                      <span>{c.phone || 'Chưa có SĐT'}</span>
                    </div>
                    {c.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#bbb', fontSize: '0.78rem', marginTop: 2 }}>
                        <MapPin size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={20} style={{ color: '#ccc', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Groups Tab */
        groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Users size={56} style={{ color: '#ddd', marginBottom: 16 }} />
            <div style={{ color: '#999', fontSize: '1rem' }}>Chưa có nhóm nào</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map(g => {
              const color = getAvatarColor(g.name);
              const count = g._count?.customers || 0;
              return (
                <div
                  key={g.id}
                  onClick={() => navigate(`/dashboard/customers/groups/${g.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#00B14F';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  {/* Group Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    backgroundColor: color.bg, color: color.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Users size={22} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333', marginBottom: 4 }}>
                      {g.name}
                    </div>
                    <div style={{ color: '#999', fontSize: '0.82rem' }}>
                      {count} khách hàng
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={20} style={{ color: '#ccc', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <>
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1040, backdropFilter: 'blur(3px)',
          }} onClick={() => setShowGroupModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: 16, padding: '2rem',
            width: '90%', maxWidth: 420, zIndex: 1050,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.15rem' }}>Tạo nhóm khách hàng</h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#888', fontSize: '0.85rem', marginBottom: 8 }}>
                Tên nhóm <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input 
                type="text"
                style={{
                  width: '100%', padding: '0.8rem 1rem',
                  border: '1px solid #e0e0e0', borderRadius: 10,
                  fontSize: '1rem', backgroundColor: '#fafafa',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                placeholder="VD: Đại lý, Khách VIP..."
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#00B14F'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowGroupModal(false)}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: 10,
                  border: '1px solid #e0e0e0', background: '#f8f8f8',
                  fontWeight: 600, cursor: 'pointer', color: '#666',
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: 10,
                  border: 'none', background: newGroupName.trim() ? '#00B14F' : '#ccc',
                  color: 'white', fontWeight: 600, cursor: newGroupName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
