import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stockCheckService } from '../services/stockCheckService';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Package, Trash2, CheckCircle } from 'lucide-react';
import './StockReceiptForm.css'; // Reusing CSS

export default function StockCheckForm() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [products, setProducts] = useState([]);
  
  const [cart, setCart] = useState([]); // array of { productId, systemStock, actualStock, name, unit }
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
    if (!exist) {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name,
        systemStock: product.stock,
        actualStock: product.stock, // Default to system stock
        unit: product.unit
      }]);
    } else {
      toast.error('Sản phẩm đã có trong phiếu kiểm kho');
    }
  };

  const updateCartItem = (productId, actualStockStr) => {
    const qty = parseInt(actualStockStr, 10);
    const validQty = isNaN(qty) ? 0 : (qty < 0 ? 0 : qty); // Không cho âm
    
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, actualStock: validQty };
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
      systemStock: i.systemStock,
      actualStock: i.actualStock,
      discrepancy: i.actualStock - i.systemStock
    })),
    status,
    note
  });

  const handleSaveDraft = async () => {
    if (cart.length === 0) return toast.error('Vui lòng chọn sản phẩm cần kiểm kê');
    
    setSubmitting(true);
    try {
      await stockCheckService.createCheck(buildPayload('DRAFT'));
      toast.success('Đã lưu nháp phiếu kiểm kho');
      navigate('/dashboard/stock-checks');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi lưu phiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (cart.length === 0) return toast.error('Vui lòng chọn sản phẩm cần kiểm kê');
    
    // Optional: Validation - confirm discrepancy
    const hasDiscrepancy = cart.some(i => i.actualStock !== i.systemStock);
    if (hasDiscrepancy) {
      const confirm = window.confirm('Có sự chênh lệch giữa tồn kho thực tế và hệ thống. Việc cân bằng sẽ cập nhật lại tồn kho hệ thống bằng với số thực tế. Tiếp tục?');
      if (!confirm) return;
    } else {
      const confirm = window.confirm('Tất cả sản phẩm đều khớp số lượng. Xác nhận hoàn tất kiểm kho?');
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      await stockCheckService.createCheck(buildPayload('BALANCED'));
      toast.success('Đã cân bằng kho thành công');
      navigate('/dashboard/stock-checks');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi cân bằng kho');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-form-page">
      {/* Header */}
      <div className="sr-form-header">
        <button className="sr-btn-back" onClick={() => navigate('/dashboard/stock-checks')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="sr-form-title">Tạo phiếu kiểm kho</h1>
      </div>

      <div className="sr-form-content">
        {/* Left Col: Product Selection */}
        <div className="sr-form-left">
          <div className="sr-panel">
            <h3 className="sr-panel-title">Danh sách kiểm kê</h3>
            
            {cart.length > 0 ? (
              <div className="sr-cart">
                <div className="sr-cart-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 40px' }}>
                  <span className="sr-cart-col sr-cart-col--name">Tên sản phẩm</span>
                  <span className="sr-cart-col sr-cart-col--qty" style={{ textAlign: 'center' }}>Tồn hệ thống</span>
                  <span className="sr-cart-col sr-cart-col--qty" style={{ textAlign: 'center' }}>Tồn thực tế</span>
                  <span className="sr-cart-col sr-cart-col--stock" style={{ textAlign: 'right' }}>Chênh lệch</span>
                  <span className="sr-cart-col sr-cart-col--action"></span>
                </div>
                {cart.map(item => {
                  const discrepancy = item.actualStock - item.systemStock;
                  return (
                    <div key={item.productId} className="sr-cart-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 40px' }}>
                      <span className="sr-cart-col sr-cart-col--name">
                        <strong>{item.name}</strong>
                      </span>
                      <span className="sr-cart-col sr-cart-col--qty" style={{ justifyContent: 'center' }}>
                        {item.systemStock} {item.unit}
                      </span>
                      <span className="sr-cart-col sr-cart-col--qty" style={{ justifyContent: 'center' }}>
                        <div className="sr-qty-input">
                          <button onClick={() => updateCartItem(item.productId, item.actualStock - 1)}>-</button>
                          <input 
                            type="number" 
                            min="0" 
                            value={item.actualStock} 
                            onChange={(e) => updateCartItem(item.productId, e.target.value)}
                          />
                          <button onClick={() => updateCartItem(item.productId, item.actualStock + 1)}>+</button>
                        </div>
                      </span>
                      <span className="sr-cart-col sr-cart-col--stock" style={{ 
                        textAlign: 'right', 
                        fontWeight: 600,
                        color: discrepancy > 0 ? '#10b981' : (discrepancy < 0 ? '#ef4444' : '#6b7280') 
                      }}>
                        {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                      </span>
                      <span className="sr-cart-col sr-cart-col--action">
                        <button className="sr-btn-remove" onClick={() => removeFromCart(item.productId)}>
                          <Trash2 size={16} />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sr-cart-empty">
                <Package size={32} />
                <p>Chưa có sản phẩm nào được đưa vào danh sách kiểm kê.</p>
                <span>Nhấn chọn sản phẩm ở danh sách bên dưới.</span>
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

        {/* Right Col: Details */}
        <div className="sr-form-right">
          <div className="sr-summary-panel">
            <h3 className="sr-panel-title">Thông tin phiếu kiểm</h3>
            
            <div className="sr-summary-row">
              <span>Tổng SP kiểm kê</span>
              <strong>{cart.length}</strong>
            </div>
            
            <div className="sr-summary-row">
              <span>SP lệch số lượng</span>
              <strong style={{ color: '#ef4444' }}>
                {cart.filter(i => i.actualStock !== i.systemStock).length}
              </strong>
            </div>
            
            <div className="sr-form-group" style={{ marginTop: '20px' }}>
              <label>Ghi chú (Không bắt buộc)</label>
              <textarea 
                placeholder="Lý do kiểm kho, ca làm việc..." 
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
              Lưu phiếu đang kiểm
            </button>
            <button 
              className="sr-btn-confirm" 
              onClick={handleConfirm}
              disabled={submitting || cart.length === 0}
            >
              Cân bằng kho (Cập nhật tồn)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
