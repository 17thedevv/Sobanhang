import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, User, Users, ChevronRight, Phone, MapPin, Filter, X, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';

export default function CustomerList() {
  const [activeTab, setActiveTab] = useState('CUSTOMERS');
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // US-80: Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterDebt, setFilterDebt] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const navigate = useNavigate();
  const toast = useToast();

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (activeTab === 'CUSTOMERS') {
      fetchCustomers();
    } else {
      fetchGroups();
    }
  }, [activeTab, debouncedSearch]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers', { params: { search: debouncedSearch?.trim() } });
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

  const activeFilterCount = [
    filterGroup !== 'ALL',
    filterGender !== 'ALL',
    filterDebt !== 'ALL',
    filterMonth !== 'ALL',
    filterType !== 'ALL'
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilterGroup('ALL');
    setFilterGender('ALL');
    setFilterDebt('ALL');
    setFilterMonth('ALL');
    setFilterType('ALL');
  };

  const filteredCustomers = customers.filter(c => {
    if (filterGroup !== 'ALL') {
      const inGroup = c.groups?.some(g => g.id === filterGroup);
      if (!inGroup) return false;
    }
    if (filterGender !== 'ALL') {
      if ((c.gender || 'OTHER') !== filterGender) return false;
    }
    if (filterDebt !== 'ALL') {
      const balance = c.debtTransactions?.[0]?.balance || 0;
      if (filterDebt === 'HAS_DEBT' && balance <= 0) return false;
      if (filterDebt === 'NO_DEBT' && balance !== 0) return false;
    }
    if (filterMonth !== 'ALL') {
      if (!c.birthday) return false;
      const bMonth = new Date(c.birthday).getMonth() + 1;
      if (bMonth !== parseInt(filterMonth, 10)) return false;
    }
    if (filterType !== 'ALL') {
      if (filterType === 'SUPPLIER' && !c.isSupplier) return false;
      if (filterType === 'COMPANY' && c.invoiceInfo?.type !== 'COMPANY' && !c.invoiceInfo?.companyName) return false;
      if (filterType === 'INDIVIDUAL' && (c.isSupplier || c.invoiceInfo?.type === 'COMPANY' || c.invoiceInfo?.companyName)) return false;
    }
    return true;
  });

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
          Danh sách khách hàng ({customers.length})
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
          Nhóm khách hàng ({groups.length})
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 450 }}>
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

        {activeTab === 'CUSTOMERS' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowFilterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.68rem 1rem',
                borderRadius: 10,
                border: activeFilterCount > 0 ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                background: activeFilterCount > 0 ? '#e6f7ec' : '#fff',
                color: activeFilterCount > 0 ? '#00B14F' : '#444',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <Filter size={16} />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span style={{
                  background: '#00B14F',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginLeft: 2,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                title="Xóa bộ lọc"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '0.68rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #fee2e2',
                  background: '#fff5f5',
                  color: '#ef4444',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Đang tải...</div>
      ) : activeTab === 'CUSTOMERS' ? (
        filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
            <User size={56} style={{ color: '#ddd', marginBottom: 16 }} />
            <div style={{ color: '#666', fontSize: '1rem', fontWeight: 600 }}>Không tìm thấy khách hàng nào</div>
            {activeFilterCount > 0 ? (
              <button 
                onClick={handleResetFilters} 
                style={{ marginTop: 12, border: 'none', background: '#00B14F', color: '#fff', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
              >
                Xoá bộ lọc
              </button>
            ) : (
              <div style={{ color: '#999', fontSize: '0.88rem', marginTop: 4 }}>Nhấn "Tạo khách hàng" để thêm mới</div>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem',
          }}>
            {filteredCustomers.map(c => {
              const color = getAvatarColor(c.name);
              const balance = c.debtTransactions?.[0]?.balance || 0;
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </div>
                      {c.isSupplier && (
                        <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
                          NCC
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: '0.82rem' }}>
                      <Phone size={13} />
                      <span>{c.phone || 'Chưa có SĐT'}</span>
                    </div>

                    {/* Badges: Debt & Groups */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {balance > 0 && (
                        <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: 6, fontWeight: 600 }}>
                          Nợ: {balance.toLocaleString()}đ
                        </span>
                      )}
                      {c.groups?.map(g => (
                        <span key={g.id} style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 6 }}>
                          {g.name}
                        </span>
                      ))}
                      {c.tags?.map(t => (
                        <span key={t.id} style={{ fontSize: '0.72rem', background: '#f3e8ff', color: '#7e22ce', padding: '1px 6px', borderRadius: 6 }}>
                          #{t.name}
                        </span>
                      ))}
                    </div>
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
            {groups.filter(g => g.name.toLowerCase().includes(search.trim().toLowerCase())).map(g => {
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

      {/* US-80: Filter Modal */}
      {showFilterModal && (
        <>
          <div 
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1040, backdropFilter: 'blur(3px)',
            }} 
            onClick={() => setShowFilterModal(false)} 
          />
          <div 
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'white', borderRadius: 16, padding: '1.75rem',
              width: '90%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', zIndex: 1050,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f7ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B14F' }}>
                  <Filter size={18} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Bộ lọc khách hàng</h4>
              </div>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Group Filter */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 6 }}>
                Nhóm khách hàng
              </label>
              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  border: '1px solid #e0e0e0', borderRadius: 8,
                  fontSize: '0.9rem', backgroundColor: '#fafafa', outline: 'none'
                }}
              >
                <option value="ALL">Tất cả các nhóm</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Customer Type */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 6 }}>
                Loại đối tượng
              </label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  border: '1px solid #e0e0e0', borderRadius: 8,
                  fontSize: '0.9rem', backgroundColor: '#fafafa', outline: 'none'
                }}
              >
                <option value="ALL">Tất cả đối tượng</option>
                <option value="INDIVIDUAL">Cá nhân</option>
                <option value="COMPANY">Doanh nghiệp / Công ty</option>
                <option value="SUPPLIER">Nhà cung cấp</option>
              </select>
            </div>

            {/* Debt Status */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 6 }}>
                Trạng thái công nợ
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'HAS_DEBT', label: 'Đang có nợ' },
                  { key: 'NO_DEBT', label: 'Không nợ' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilterDebt(item.key)}
                    style={{
                      flex: 1, minWidth: '90px', padding: '0.5rem 0.75rem', borderRadius: 8,
                      border: filterDebt === item.key ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                      background: filterDebt === item.key ? '#e6f7ec' : '#fff',
                      color: filterDebt === item.key ? '#00B14F' : '#666',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 6 }}>
                Giới tính
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'MALE', label: 'Nam' },
                  { key: 'FEMALE', label: 'Nữ' },
                  { key: 'OTHER', label: 'Khác' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilterGender(item.key)}
                    style={{
                      flex: 1, padding: '0.5rem 0.5rem', borderRadius: 8,
                      border: filterGender === item.key ? '1.5px solid #00B14F' : '1px solid #e0e0e0',
                      background: filterGender === item.key ? '#e6f7ec' : '#fff',
                      color: filterGender === item.key ? '#00B14F' : '#666',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Birthday Month */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#444', fontSize: '0.85rem', marginBottom: 6 }}>
                Tháng sinh nhật
              </label>
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  border: '1px solid #e0e0e0', borderRadius: 8,
                  fontSize: '0.9rem', backgroundColor: '#fafafa', outline: 'none'
                }}
              >
                <option value="ALL">Tất cả các tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m.toString()}>Tháng {m}</option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleResetFilters}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: 10,
                  border: '1px solid #e0e0e0', background: '#f8f8f8',
                  fontWeight: 600, cursor: 'pointer', color: '#666',
                }}
              >
                Thiết lập lại
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: 10,
                  border: 'none', background: '#00B14F',
                  color: 'white', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 177, 79, 0.25)'
                }}
              >
                Áp dụng {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
