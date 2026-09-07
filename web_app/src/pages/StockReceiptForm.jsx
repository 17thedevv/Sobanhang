import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stockReceiptService } from '../services/stockReceiptService';
import { formatMoneyVND } from '../utils/moneyUtils';
import { useToast } from '../context/ToastContext';
import MoneyInput from '../components/MoneyInput';
import { ArrowLeft, Package, Trash2, X } from 'lucide-react';
import './StockReceiptForm.css';

export default function StockReceiptForm() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cashSources, setCashSources] = useState([]);
  
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [cart, setCart] = useState([]); // array of { productId, quantity, importPrice, ...productDetails }
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [note, setNote] = useState('');
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [cashSourceId, setCashSourceId] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('/api/customers').then(res => setSuppliers(res.data.customers || [])),
      axios.get('/api/products').then(res => setProducts(res.data.products || [])),
      axios.get('/api/cashbook/sources').then(res => {
        setCashSources(res.data.sources || []);
        if (res.data.sources?.length > 0) {
          setCashSourceId(res.data.sources[0].id);
        }
      })
    ]).catch(err => {
      console.error(err);
      toast.error('Lỗi tải dữ liệu cơ sở');
    });
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);
  const finalAmount = totalAmount - discount + shippingFee;

  useEffect(() => {
    setPaidAmount(finalAmount);
  }, [finalAmount]);

  const addToCart = (product) => {
    const exist = cart.find(i => i.productId === product.id);
    if (exist) {
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name,
        quantity: 1, 
        importPrice: product.price * 0.8 || 0, // default import price
        unit: product.unit
      }]);
    }
  };

  const updateCartItem = (productId, field, value) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const buildPayload = (status) => ({
    supplierId: selectedSupplierId || null,
    items: cart.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      importPrice: i.importPrice,
      subTotal: i.quantity * i.importPrice
    })),
    totalAmount,
    discount,
    shippingFee,
    finalAmount,
    paidAmount: status === 'DRAFT' ? 0 : paidAmount,
    cashSourceId: (status === 'COMPLETED' && paidAmount > 0) ? cashSourceId : undefined,
    status,
    note
  });

  const handleSaveDraft = async () => {
    if (cart.length === 0) return toast.error('Vui lòng chọn sản phẩm');
    
    try {
      await stockReceiptService.createReceipt(buildPayload('DRAFT'));
      toast.success('Đã lưu nháp phiếu nhập hàng');
      navigate('/dashboard/stock-receipts');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi lưu nháp');
    }
  };

  const handleComplete = async () => {
    if (cart.length === 0) return toast.error('Vui lòng chọn sản phẩm');
    
    try {
      await stockReceiptService.createReceipt(buildPayload('COMPLETED'));
      toast.success('Nhập hàng thành công');
      navigate('/dashboard/stock-receipts');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi nhập hàng');
    }
  };

  return (
    <div className="srf-page">
      {/* Header */}
      <div className="srf-header">
        <button className="srf-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="srf-title">Tạo phiếu nhập hàng</h2>
      </div>

      {/* Body */}
      <div className="srf-body">
        
        {/* Left Side: Supplier & Products */}
        <div className="srf-left">
          <div className="srf-card">
            <h3 className="srf-card-title">Thông tin nhập hàng</h3>
            
            <div className="srf-form-group">
              <label className="srf-form-label">Nhà cung cấp</label>
              <select 
                value={selectedSupplierId} 
                onChange={e => setSelectedSupplierId(e.target.value)}
                className="srf-input"
              >
                <option value="">-- Chọn nhà cung cấp (Khách lẻ) --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name} {sup.phone ? `- ${sup.phone}` : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="srf-form-group" style={{ marginBottom: 0 }}>
              <label className="srf-form-label">Ghi chú phiếu nhập</label>
              <input 
                type="text" 
                placeholder="VD: Nhập đợt 1 tháng 9..."
                className="srf-input"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="srf-card">
            <h3 className="srf-card-title">Chọn sản phẩm</h3>
            <div className="srf-product-grid">
              {products.map(p => (
                <div key={p.id} className="srf-product-item" onClick={() => addToCart(p)}>
                  <div className="srf-product-icon">
                    <Package size={24} />
                  </div>
                  <div className="srf-product-name">{p.name}</div>
                  <div className="srf-product-stock">Tồn: {p.stock}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart & Summary */}
        <div className="srf-right">
          <div className="srf-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="srf-card-title">Giỏ hàng ({cart.length})</h3>
            
            <div className="srf-cart-list" style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div className="srf-cart-empty">
                  Chưa có sản phẩm nào được chọn
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="srf-cart-item">
                    <div className="srf-cart-header">
                      <span className="srf-cart-name">{item.name}</span>
                      <Trash2 size={20} className="srf-cart-remove" onClick={() => removeFromCart(item.productId)} />
                    </div>
                    
                    <div className="srf-cart-inputs">
                      <div>
                        <label className="srf-form-label" style={{ fontSize: '0.8rem', color: '#888' }}>Số lượng</label>
                        <input 
                          type="number" 
                          className="srf-input" 
                          value={item.quantity} 
                          min="1"
                          onChange={e => updateCartItem(item.productId, 'quantity', Number(e.target.value))} 
                        />
                      </div>
                      <div>
                        <label className="srf-form-label" style={{ fontSize: '0.8rem', color: '#888' }}>Giá nhập</label>
                        <MoneyInput 
                          value={item.importPrice}
                          onChange={val => updateCartItem(item.productId, 'importPrice', val)}
                          className="srf-input"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '24px' }}>
              <div className="srf-summary-row">
                <span>Tổng tiền hàng:</span>
                <span style={{ fontWeight: 500 }}>{formatMoneyVND(totalAmount)}</span>
              </div>
              
              <div className="srf-summary-row">
                <span>Giảm giá:</span>
                <div className="srf-input-small">
                  <MoneyInput value={discount} onChange={setDiscount} className="srf-input" />
                </div>
              </div>

              <div className="srf-summary-row">
                <span>Phí phát sinh:</span>
                <div className="srf-input-small">
                  <MoneyInput value={shippingFee} onChange={setShippingFee} className="srf-input" />
                </div>
              </div>

              <div className="srf-summary-total">
                <span>Cần thanh toán:</span>
                <span className="srf-total-value">{formatMoneyVND(finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="srf-bottom-bar">
        <button className="srf-btn srf-btn--secondary" onClick={handleSaveDraft}>
          Lưu nháp
        </button>
        <button className="srf-btn srf-btn--primary" onClick={() => setShowPayment(true)}>
          Thanh toán
        </button>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="srf-payment-overlay">
          <div className="srf-payment-modal">
            <div className="srf-payment-header">
              <h3>Thanh toán nhập hàng</h3>
              <button className="srf-back-btn" onClick={() => setShowPayment(false)} style={{ width: 32, height: 32 }}>
                <X size={18} />
              </button>
            </div>
            
            <div className="srf-payment-body">
              <div className="srf-payment-amount">
                <span>Tổng cộng phải trả</span>
                <strong>{formatMoneyVND(finalAmount)}</strong>
              </div>

              <div className="srf-form-group">
                <label className="srf-form-label">Nguồn tiền thanh toán</label>
                <select 
                  value={cashSourceId} 
                  onChange={e => setCashSourceId(e.target.value)}
                  className="srf-input"
                >
                  {cashSources.map(source => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </div>

              <div className="srf-form-group">
                <label className="srf-form-label">Số tiền trả Nhà Cung Cấp</label>
                <MoneyInput 
                  value={paidAmount}
                  onChange={setPaidAmount}
                  className="srf-input"
                />
              </div>

              {paidAmount < finalAmount && (
                <div className="srf-debt-notice">
                  <div className="srf-debt-header">
                    <span>Còn nợ:</span>
                    <span>{formatMoneyVND(finalAmount - paidAmount)}</span>
                  </div>
                  <div className="srf-debt-desc">
                    Hệ thống sẽ tự động ghi nợ khoản này vào Sổ Nợ của nhà cung cấp.
                  </div>
                </div>
              )}

              <button 
                className="srf-btn srf-btn--primary" 
                style={{ width: '100%', marginTop: '24px' }}
                onClick={handleComplete}
              >
                XÁC NHẬN NHẬP KHO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
