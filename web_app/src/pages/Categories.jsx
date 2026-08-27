import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, X, PackageSearch } from 'lucide-react';
import axios from 'axios';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }
    
    try {
      const trimmedName = name.trim();
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, { name: trimmedName });
      } else {
        await axios.post('/api/categories', { name: trimmedName });
      }
      setShowModal(false);
      setName('');
      setEditingCategory(null);
      setError('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    setName(category ? category.name : '');
    setError('');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`/api/categories/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi xóa');
      setDeleteConfirm(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="page-container categories-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Danh mục</h1>
          <p className="page-subtitle">Quản lý và phân loại các mặt hàng của bạn</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Thêm danh mục
        </button>
      </header>

      {error && !showModal && (
        <div className="error-alert mb-4">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="close-btn" data-tooltip="Đóng" onClick={() => setError('')}><X size={16}/></button>
        </div>
      )}

      <div className="card categories-card">
        <div className="search-bar">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted">Đang tải dữ liệu...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon glass">
              <PackageSearch size={40} className="text-muted" />
            </div>
            <h3>Không tìm thấy danh mục</h3>
            <p>Bấm "Thêm danh mục" để bắt đầu phân loại sản phẩm.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Số lượng SP</th>
                  <th>Ngày tạo</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(cat => (
                  <tr key={cat.id}>
                    <td className="font-medium text-primary">{cat.name}</td>
                    <td>{cat._count?.products || 0} sản phẩm</td>
                    <td className="text-muted">{new Date(cat.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="actions-cell">
                      <button className="btn-icon" data-tooltip="Sửa danh mục" onClick={() => openModal(cat)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon text-danger" data-tooltip="Xóa danh mục" onClick={() => setDeleteConfirm(cat)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay glass" onClick={() => setShowModal(false)}>
          <div className="modal-content card small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button className="btn-icon" data-tooltip="Đóng" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              {error && <div className="error-alert mb-3" style={{position:'static'}}><AlertCircle size={16}/> {error}</div>}
              <div className="form-group mb-0">
                <label>Tên danh mục <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên danh mục (VD: Đồ uống, Đồ ăn vặt)"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {deleteConfirm && (
        <div className="modal-overlay glass" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content card small-modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header border-0">
              <h3 className="text-danger">Xác nhận xóa</h3>
              <button className="btn-icon" data-tooltip="Đóng" onClick={() => setDeleteConfirm(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa danh mục <strong>{deleteConfirm.name}</strong> không?</p>
              {deleteConfirm._count?.products > 0 && (
                <div className="error-alert mt-3" style={{position:'static', fontSize:'13px'}}>
                  <AlertCircle size={16} style={{flexShrink:0}} /> 
                  <span>Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển các sản phẩm sang danh mục khác trước.</span>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button 
                className="btn-primary" 
                style={{ backgroundColor: 'var(--danger)' }}
                onClick={handleDelete}
                disabled={deleteConfirm._count?.products > 0}
              >
                Xóa danh mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
