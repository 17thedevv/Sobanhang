import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stockIssueService } from '../services/stockIssueService';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Package, Trash2, X } from 'lucide-react';
import './StockReceiptForm.css'; // Reusing CSS

export default function StockIssueForm() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [products, setProducts] = useState([]);
  
  const [cart, setCart] = useState([]); // array of { productId, quantity, name, unit, stock }
  const [note, setNote] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data.products || []))
      .catch(err => {
        console.error(err);
        toast.error('Lỗi tải danh sách sản phẩm');
      });
  }, []);

  const addToCart = (product) => {
    const exist = cart.find(i => i.productId === product.id);
    if (exist) {
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name,
        quantity: 1, 
        unit: product.unit,
        stock: product.stock
      }]);
    }
  };

  const updateCartItem = (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) return;
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const buildPayload = (status) => ({
    items: cart.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    })),
    status,
    note
  });

  const handleSaveDraft = async () => {
    if (cart.length === 0) return toast.error('Vui lòng chọn sản phẩm cần xuất');
    
    setSubmitting(true);
    try {
      await stockIssueService.createIssue(buildPayload('DRAFT'));
      toast.success('Đã lưu nháp phiếu xuất');
      navigate('/dashboard/stock-issues');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi lưu phiếu xuất');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (cart.length === 0) return toast.error('Vui lòng chọn sản phẩm cần xuất');
    
    // Optional: Validation - warn if issue quantity > current stock
    const overStock = cart.find(i => i.quantity > i.stock);
    if (overStock) {
      const confirm = window.confirm(`Sản phẩm "${overStock.name}" có số lượng xuất (${overStock.quantity}) lớn hơn tồn kho hiện tại (${overStock.stock}). Bạn có chắc chắn muốn xuất?`);
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      await stockIssueService.createIssue(buildPayload('COMPLETED'));
      toast.success('Đã xuất kho thành công');
      navigate('/dashboard/stock-issues');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi xuất kho');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-form-page">
      {/* Header */}
      <div className="sr-form-header">
        <button className="sr-btn-back" onClick={() => navigate('/dashboard/stock-issues')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="sr-form-title">Tạo phiếu xuất kho</h1>
      </div>

      <div className="sr-form-content">
        {/* Left Col: Product Selection */}
        <div className="sr-form-left">
          <div className="sr-panel">
            <h3 className="sr-panel-title">Sản phẩm xuất kho</h3>
            
            {cart.length > 0 ? (
              <div className="sr-cart">
                <div className="sr-cart-header">
                  <span className="sr-cart-col sr-cart-col--name">Tên sản phẩm</span>
                  <span className="sr-cart-col sr-cart-col--qty">Số lượng xuất</span>
                  <span className="sr-cart-col sr-cart-col--stock">Tồn kho hiện tại</span>
                  <span className="sr-cart-col sr-cart-col--action"></span>
                </div>
                {cart.map(item => (
                  <div key={item.productId} className="sr-cart-row">
                    <span className="sr-cart-col sr-cart-col--name">
                      <strong>{item.name}</strong>
                    </span>
                    <span className="sr-cart-col sr-cart-col--qty">
                      <div className="sr-qty-input">
                        <button onClick={() => updateCartItem(item.productId, item.quantity - 1)}>-</button>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => updateCartItem(item.productId, e.target.value)}
                        />
                        <button onClick={() => updateCartItem(item.productId, item.quantity + 1)}>+</button>
                      </div>
                    </span>
                    <span className="sr-cart-col sr-cart-col--stock">
                      {item.stock} {item.unit}
                    </span>
                    <span className="sr-cart-col sr-cart-col--action">
                      <button className="sr-btn-remove" onClick={() => removeFromCart(item.productId)}>
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sr-cart-empty">
                <Package size={32} />
                <p>Chưa có sản phẩm nào được chọn.</p>
                <span>Nhấn chọn sản phẩm ở danh sách bên dưới để thêm vào phiếu xuất.</span>
              </div>
            )}
          </div>

          <div className="sr-panel">
            <h3 className="sr-panel-title">Chọn từ danh mục ({products.length})</h3>
            <div className="sr-product-grid">
              {products.map(p => {
                const isSelected = cart.some(i => i.productId === p.id);
                return (
                  <div 
                    key={p.id} 
                    className={`sr-product-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => addToCart(p)}
                  >
                    <div className="sr-product-img">
                      {p.image ? (
                        <img src={p.image} alt={p.name} />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>
                    <div className="sr-product-info">
                      <h4>{p.name}</h4>
                      <span className="sr-product-stock">Tồn: {p.stock}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Issue Details */}
        <div className="sr-form-right">
          <div className="sr-summary-panel">
            <h3 className="sr-panel-title">Thông tin xuất kho</h3>
            
            <div className="sr-summary-row">
              <span>Tổng số loại SP</span>
              <strong>{cart.length}</strong>
            </div>
            
            <div className="sr-summary-row">
              <span>Tổng số lượng xuất</span>
              <strong>{cart.reduce((sum, i) => sum + i.quantity, 0)}</strong>
            </div>
            
            <div className="sr-form-group" style={{ marginTop: '20px' }}>
              <label>Ghi chú (Không bắt buộc)</label>
              <textarea 
                placeholder="Lý do xuất, thông tin bổ sung..." 
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '8px' }}
              />
            </div>
          </div>

          <div className="sr-form-actions">
            <button 
              className="sr-btn-save-draft" 
              onClick={handleSaveDraft}
              disabled={submitting}
            >
              Lưu nháp
            </button>
            <button 
              className="sr-btn-confirm" 
              onClick={handleConfirm}
              disabled={submitting || cart.length === 0}
            >
              Xác nhận xuất kho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
