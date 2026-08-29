import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Search, UserPlus, UserMinus, User, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // For Add Customers Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(new Set());
  const [addSearch, setAddSearch] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      // Prisma does not have a direct API in customer.controller to fetch a single group with customers easily unless we add one.
      // Wait, we need an API to get group details. Let's add it to the backend.
      const res = await axios.get(`/api/customers/groups/${groupId}`);
      setGroup(res.data.group);
    } catch (err) {
      console.error(err);
      toast.error('Không tìm thấy nhóm');
      navigate('/dashboard/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCustomer = async (customerId) => {
    if (!window.confirm('Bạn có chắc muốn gỡ khách hàng này khỏi nhóm?')) return;
    try {
      await axios.post(`/api/customers/groups/${groupId}/remove`, { customerIds: [customerId] });
      fetchGroupData();
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleOpenAddModal = async () => {
    try {
      const res = await axios.get('/api/customers');
      // filter out already in group
      const inGroupIds = new Set(group.customers.map(c => c.id));
      setAllCustomers(res.data.customers.filter(c => !inGroupIds.has(c.id)));
      setSelectedCustomerIds(new Set());
      setAddSearch('');
      setShowAddModal(true);
    } catch (err) {
      toast.error('Không thể tải danh sách khách hàng');
    }
  };

  const handleToggleSelect = (id) => {
    const newSet = new Set(selectedCustomerIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCustomerIds(newSet);
  };

  const handleAddSubmit = async () => {
    try {
      await axios.post(`/api/customers/groups/${groupId}/add`, { customerIds: Array.from(selectedCustomerIds) });
      setShowAddModal(false);
      fetchGroupData();
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa nhóm này?')) return;
    try {
      await axios.delete(`/api/customers/groups/${groupId}`);
      navigate('/dashboard/customers');
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (!group) return null;

  const filteredCustomers = group.customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <header className="page-header d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button className="btn-icon me-2" onClick={() => navigate('/dashboard/customers')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title mb-0">{group.name}</h1>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteGroup}>
            <Trash2 size={16} />
          </button>
          <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={handleOpenAddModal}>
            <UserPlus size={16} /> <span className="ms-1 d-none d-sm-inline">Thêm khách</span>
          </button>
        </div>
      </header>

      <div className="position-relative mb-3">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm tên khách hàng trong nhóm..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-control ps-5"
        />
      </div>

      <div className="mb-3 text-muted small">
        Tổng số: {group.customers.length} khách hàng
      </div>

      <div className="list-group">
        {filteredCustomers.map(c => (
          <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
            <div className="d-flex align-items-center">
              <div className="avatar me-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: 48, height: 48}}>
                <User size={24} className="text-muted" />
              </div>
              <div>
                <div className="fw-bold">{c.name}</div>
                <div className="text-muted small">{c.phone || 'Chưa có SĐT'}</div>
              </div>
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveCustomer(c.id)}>
              Gỡ
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ maxWidth: 500, width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Thêm khách hàng</h4>
              <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            
            <div className="position-relative mb-3">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm tên..." 
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                className="form-control ps-5"
              />
            </div>

            <div className="flex-grow-1 overflow-auto mb-3">
              <div className="list-group">
                {allCustomers.filter(c => c.name.toLowerCase().includes(addSearch.toLowerCase())).map(c => (
                  <label key={c.id} className="list-group-item d-flex align-items-center cursor-pointer border-0 border-bottom">
                    <input 
                      type="checkbox" 
                      className="form-check-input me-3" 
                      checked={selectedCustomerIds.has(c.id)}
                      onChange={() => handleToggleSelect(c.id)}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{c.name}</div>
                      <div className="text-muted small">{c.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div>Đã chọn: <strong>{selectedCustomerIds.size}</strong></div>
              <button 
                className="btn btn-primary" 
                onClick={handleAddSubmit} 
                disabled={selectedCustomerIds.size === 0}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
