import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Plus, Minus, PackageSearch, Receipt, ChevronLeft, 
  ChevronRight, X, UserPlus, CreditCard, ScanLine, Wallet
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import axios from 'axios';
import './POS.css';

export default function POS() {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, checkout } = useApp();
  
  // States cho Lọc / Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  // Data Master
  const [customers, setCustomers] = useState([]);
  const [cashSources, setCashSources] = useState([]);

  // Flow State
  const [view, setView] = useState('PRODUCTS'); // 'PRODUCTS' | 'CHECKOUT' | 'PAYMENT'
  const [priceType, setPriceType] = useState('RETAIL'); // 'RETAIL' | 'WHOLESALE'
  
  // Order Metadata
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  // Payment State
  const [isDebt, setIsDebt] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  
  // After Checkout
  const [lastOrder, setLastOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data.categories || [])).catch(console.error);
    axios.get('/api/customers').then(res => setCustomers(res.data.customers || [])).catch(console.error);
    axios.get('/api/cashbook/sources').then(res => {
      const sources = res.data.sources || [];
      setCashSources(sources);
      const defaultSource = sources.find(s => s.isDefault) || sources[0];
      if (defaultSource) setSelectedSource(defaultSource.id);
    }).catch(console.error);
  }, []);

  // Filter Products
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.toLowerCase().includes(term));
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  const cartItems = Object.values(cart);
  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate Base Cart Total (with Wholesale logic)
  const cartBaseTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      // Mock: Wholesale = 10% off
      const itemPrice = priceType === 'WHOLESALE' ? item.product.price * 0.9 : item.product.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems, priceType]);

  const finalTotal = Math.max(0, cartBaseTotal - Number(discount)) + Number(shippingFee);

  // Sync amountPaid default
  useEffect(() => {
    if (view === 'PAYMENT' && amountPaid === '') {
      setAmountPaid(finalTotal.toString());
    }
  }, [view, finalTotal, amountPaid]);

  const handleCheckout = async (type) => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    
    // type = 'QUICK_SALE' | 'DELIVERY_LATER' | 'DEBT_SALE'
    let orderType = type;
    if (type === 'QUICK_SALE' && isDebt) {
      orderType = 'DEBT_SALE';
    }

    try {
      const payload = {
        type: orderType,
        customerId: selectedCustomer || undefined,
        discount: Number(discount),
        shippingFee: Number(shippingFee),
        cashSourceId: orderType === 'QUICK_SALE' ? selectedSource : undefined,
      };

      const order = await checkout(payload);
      setLastOrder(order);
      setIsInvoiceOpen(true);
      
      // Reset flow
      setView('PRODUCTS');
      setDiscount(0);
      setShippingFee(0);
      setSelectedCustomer('');
      setIsDebt(false);
      setAmountPaid('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderProductsView = () => (
    <div className="pos-products-view">
      <header className="pos-header">
        <div className="search-bar">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm (Tên, SKU)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <ScanLine size={20} className="text-muted cursor-pointer ml-auto" title="Quét mã vạch" />
        </div>
      </header>

      <div className="category-chips">
        <button 
          className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => {
          const qty = cart[product.id]?.quantity || 0;
          return (
            <div key={product.id} className="product-card">
              <div className="product-image-placeholder">
                <PackageSearch size={24} color="#ccc" />
              </div>
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <div className="product-price">{product.price.toLocaleString('vi-VN')}đ</div>
              </div>
              <div className="product-action">
                {qty > 0 ? (
                  <div className="qty-counter">
                    <button className="qty-btn" onClick={() => removeFromCart(product.id)}><Minus size={14}/></button>
                    <input 
                      type="number" 
                      className="qty-value-input" 
                      value={qty} 
                      onChange={(e) => updateCartQuantity(product, e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                    <button className="qty-btn add" onClick={() => addToCart(product)}><Plus size={14}/></button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => addToCart(product)}>+ Thêm</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cartQuantity > 0 && (
        <div className="bottom-bar-fixed" onClick={() => setView('CHECKOUT')}>
          <div className="cart-badge">
            <Receipt size={20} />
            <span className="badge-count">{cartQuantity}</span>
          </div>
          <div className="cart-total">
            <span>{cartBaseTotal.toLocaleString('vi-VN')}đ</span>
            <ChevronRight size={20} />
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckoutView = () => (
    <div className="pos-checkout-view">
      <header className="checkout-header">
        <button className="back-btn" onClick={() => setView('PRODUCTS')}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="title">Xác nhận đơn</h2>
        <select 
          className="price-type-select"
          value={priceType}
          onChange={(e) => setPriceType(e.target.value)}
        >
          <option value="RETAIL">Giá lẻ</option>
          <option value="WHOLESALE">Giá sỉ</option>
        </select>
      </header>

      <div className="checkout-body">
        <button className="add-more-btn" onClick={() => setView('PRODUCTS')}>
          + Thêm sản phẩm
        </button>

        <div className="cart-items-list">
          {cartItems.map(item => {
            const itemPrice = priceType === 'WHOLESALE' ? item.product.price * 0.9 : item.product.price;
            return (
              <div key={item.product.id} className="cart-list-item">
                <div className="item-img"><PackageSearch size={20} color="#ccc" /></div>
                <div className="item-details">
                  <h4 className="item-name">{item.product.name}</h4>
                  <div className="item-price">{itemPrice.toLocaleString('vi-VN')}đ</div>
                </div>
                <div className="item-actions">
                  <div className="qty-counter small">
                    <button className="qty-btn" onClick={() => removeFromCart(item.product.id)}><Minus size={12}/></button>
                    <input 
                      type="number" 
                      className="qty-value-input" 
                      value={item.quantity} 
                      onChange={(e) => updateCartQuantity(item.product, e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                    <button className="qty-btn add" onClick={() => addToCart(item.product)}><Plus size={12}/></button>
                  </div>
                  <button className="remove-btn" onClick={() => {
                    // Quick hack to remove all: just set to 0
                    for(let i=0; i<item.quantity; i++) removeFromCart(item.product.id);
                  }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="order-metadata">
          <div className="meta-row">
            <span className="meta-label">
              <UserPlus size={16} /> Khách hàng
            </span>
            <select 
              className="meta-input"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">-- Khách lẻ --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="meta-row">
            <span className="meta-label">Giảm giá</span>
            <input 
              type="number" 
              className="meta-input text-right"
              placeholder="0"
              value={discount || ''}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <div className="meta-row">
            <span className="meta-label">Vận chuyển</span>
            <input 
              type="number" 
              className="meta-input text-right"
              placeholder="0"
              value={shippingFee || ''}
              onChange={(e) => setShippingFee(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="checkout-footer">
        <div className="summary-row">
          <span>Tổng cộng</span>
          <span className="final-total">{finalTotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="checkout-actions">
          <button 
            className="btn-secondary" 
            onClick={() => handleCheckout('DELIVERY_LATER')}
            disabled={isCheckingOut}
          >
            GIAO SAU
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setView('PAYMENT')}
          >
            THANH TOÁN
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentView = () => (
    <div className="pos-payment-view">
      <header className="checkout-header">
        <button className="back-btn" onClick={() => setView('CHECKOUT')}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="title">Thanh toán</h2>
      </header>

      <div className="payment-body">
        <div className="payment-summary">
          <h3>Tổng tiền cần thu</h3>
          <div className="payment-total">{finalTotal.toLocaleString('vi-VN')}đ</div>
        </div>

        <div className="payment-form">
          <div className="form-group">
            <label>Tiền khách đưa</label>
            <input 
              type="number" 
              className="form-control"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
            />
            {Number(amountPaid) > finalTotal && (
              <div className="change-due mt-1 text-success">
                Tiền thừa trả khách: {(Number(amountPaid) - finalTotal).toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>

          <div className="form-group mt-3">
            <label className="d-flex justify-content-between align-items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Nguồn tiền nhận</span>
            </label>
            <select 
              className="form-control"
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              disabled={isDebt}
            >
              {cashSources.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.balance.toLocaleString()}đ)</option>
              ))}
            </select>
          </div>

          <div className="form-group mt-4 debt-checkbox-group">
            <label className="debt-checkbox-label">
              <input 
                type="checkbox" 
                checked={isDebt} 
                onChange={e => setIsDebt(e.target.checked)} 
                className="custom-checkbox"
              />
              <span className="checkbox-text">Ghi nợ đơn này</span>
            </label>
            {isDebt && !selectedCustomer && (
              <div className="text-danger mt-1 text-sm">
                * Vui lòng chọn khách hàng để ghi nợ (quay lại màn Xác nhận)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="checkout-footer">
        <button 
          className="btn-primary w-100 btn-large"
          disabled={isCheckingOut || (isDebt && !selectedCustomer)}
          onClick={() => handleCheckout('QUICK_SALE')}
        >
          {isCheckingOut ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="pos-container mobile-layout">
      {view === 'PRODUCTS' && renderProductsView()}
      {view === 'CHECKOUT' && renderCheckoutView()}
      {view === 'PAYMENT' && renderPaymentView()}

      {isInvoiceOpen && lastOrder && (
        <InvoiceModal 
          order={lastOrder} 
          onClose={() => {
            setIsInvoiceOpen(false);
            setLastOrder(null);
          }} 
          onNewOrder={() => {
            setIsInvoiceOpen(false);
            setLastOrder(null);
          }}
        />
      )}
    </div>
  );
}
