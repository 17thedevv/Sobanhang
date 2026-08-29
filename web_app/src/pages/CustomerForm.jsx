import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function CustomerForm() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = !!customerId;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
    avatarUrl: '',
    email: '',
    isSupplier: false,
    birthday: '',
    gender: 'OTHER',
    groupIds: [],
    tagIds: [],
    invoiceInfo: {
      taxCode: '',
      companyName: '',
      address: '',
      email: ''
    }
  });

  const [allGroups, setAllGroups] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
    if (isEditing) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchOptions = async () => {
    try {
      const [gRes, tRes] = await Promise.all([
        axios.get('/api/customers/groups/all'),
        axios.get('/api/customers/tags/all')
      ]);
      setAllGroups(gRes.data.groups || []);
      setAllTags(tRes.data.tags || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      // Wait, there is no getCustomerById in customer.controller.ts! 
      // I need to fetch all and find, or add an API. Let's assume there is one or I will just fetch all and find for now.
      const res = await axios.get('/api/customers');
      const c = res.data.customers.find(x => x.id === customerId);
      if (c) {
        setFormData({
          name: c.name || '',
          phone: c.phone || '',
          address: c.address || '',
          note: c.note || '',
          avatarUrl: c.avatarUrl || '',
          email: c.email || '',
          isSupplier: c.isSupplier || false,
          birthday: c.birthday ? new Date(c.birthday).toISOString().split('T')[0] : '',
          gender: c.gender || 'OTHER',
          groupIds: c.groups ? c.groups.map(g => g.id) : [],
          tagIds: c.tags ? c.tags.map(t => t.id) : [],
          invoiceInfo: c.invoiceInfo ? {
            taxCode: c.invoiceInfo.taxCode || '',
            companyName: c.invoiceInfo.companyName || '',
            address: c.invoiceInfo.address || '',
            email: c.invoiceInfo.email || ''
          } : { taxCode: '', companyName: '', address: '', email: '' }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('invoice_')) {
      const field = name.replace('invoice_', '');
      setFormData(prev => ({
        ...prev,
        invoiceInfo: {
          ...prev.invoiceInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleMultiSelectChange = (e, field) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean invoice info if empty
      const payload = { ...formData };
      if (!payload.invoiceInfo.taxCode && !payload.invoiceInfo.companyName) {
        delete payload.invoiceInfo;
      }

      if (isEditing) {
        await axios.put(`/api/customers/${customerId}`, payload);
      } else {
        await axios.post('/api/customers', payload);
      }
      navigate('/dashboard/customers');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
      <header className="page-header d-flex align-items-center mb-4">
        <button className="btn-icon me-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title mb-0">{isEditing ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}</h1>
      </header>

      {loading ? (
        <div className="text-center py-5">Đang tải...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm border">
          <div className="mb-3">
            <label className="form-label fw-bold">Tên khách hàng <span className="text-danger">*</span></label>
            <input required type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Số điện thoại</label>
              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Ngày sinh</label>
              <input type="date" className="form-control" name="birthday" value={formData.birthday} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Giới tính</label>
              <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="OTHER">Khác</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Địa chỉ</label>
            <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Phân loại Nhóm</label>
            <select multiple className="form-select" value={formData.groupIds} onChange={(e) => handleMultiSelectChange(e, 'groupIds')} style={{ height: 100 }}>
              {allGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <small className="text-muted">Giữ Ctrl (hoặc Cmd) để chọn nhiều</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Phân loại Nhãn</label>
            <select multiple className="form-select" value={formData.tagIds} onChange={(e) => handleMultiSelectChange(e, 'tagIds')} style={{ height: 100 }}>
              {allTags.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <small className="text-muted">Giữ Ctrl (hoặc Cmd) để chọn nhiều</small>
          </div>

          <div className="mb-4 form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="isSupplierSwitch" name="isSupplier" checked={formData.isSupplier} onChange={handleChange} />
            <label className="form-check-label fw-bold" htmlFor="isSupplierSwitch">Đồng thời là Nhà cung cấp</label>
          </div>

          <div className="card mb-4 border-light shadow-sm">
            <div className="card-header bg-light fw-bold">Thông tin xuất hóa đơn (Tùy chọn)</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Mã số thuế</label>
                <input type="text" className="form-control" name="invoice_taxCode" value={formData.invoiceInfo.taxCode} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Tên công ty</label>
                <input type="text" className="form-control" name="invoice_companyName" value={formData.invoiceInfo.companyName} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Địa chỉ</label>
                <input type="text" className="form-control" name="invoice_address" value={formData.invoiceInfo.address} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email nhận HĐ</label>
                <input type="email" className="form-control" name="invoice_email" value={formData.invoiceInfo.email} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Ghi chú thêm</label>
            <textarea className="form-control" rows="3" name="note" value={formData.note} onChange={handleChange}></textarea>
          </div>

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light flex-grow-1" onClick={() => navigate(-1)}>Hủy</button>
            <button type="submit" className="btn btn-primary flex-grow-1 d-flex justify-content-center align-items-center">
              <Save size={18} className="me-2" /> Lưu khách hàng
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
