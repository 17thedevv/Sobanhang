import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';
import './ProductModal.css';

export default function ProductModal({ product, onClose }) {
  const { addProduct, updateProduct } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'Cái',
    stock: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        unit: product.unit,
        stock: product.stock
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const productData = {
      name: formData.name,
      price: Number(formData.price),
      unit: formData.unit,
      stock: Number(formData.stock) || 0
    };

    let success = false;
    if (product) {
      success = await updateProduct({ ...product, ...productData });
    } else {
      success = await addProduct(productData);
    }
    
    setLoading(false);
    if (success) onClose();
  };

  return (
    <div className="modal-overlay glass" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Tên sản phẩm *</label>
            <input 
              type="text" 
              name="name"
              className="input-field" 
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Giá bán (đ) *</label>
              <input 
                type="number" 
                name="price"
                className="input-field" 
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label className="label">Đơn vị</label>
              <input 
                type="text" 
                name="unit"
                className="input-field" 
                value={formData.unit}
                onChange={handleChange}
                placeholder="Cái, Hộp, Thùng..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Tồn kho hiện tại</label>
            <input 
              type="number" 
              name="stock"
              className="input-field" 
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
