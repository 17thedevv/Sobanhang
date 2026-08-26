import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Minus, PackageSearch, Receipt } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import axios from 'axios';
import './POS.css';

export default function POS() {
  const { products, cart, addToCart, removeFromCart, clearCart, cartTotalAmount } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isDebt, setIsDebt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data.categories || [])).catch(console.error);
  }, []);

  const { checkout } = useApp();

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.toLowerCase().includes(term));
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  const cartItems = Object.values(cart);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    try {
      const order = await checkout(isDebt, paymentMethod);
      setLastOrder(order);
      setIsInvoiceOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="pos-container">
      {/* Left side: Products Grid */}
      <div className="pos-products">
        <header className="page-header pos-header">
          <h1 className="page-title">Bán hàng (POS)</h1>
          <div className="search-bar compact">
            <Search size={20} className="text-muted" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        {/* Chip Filter theo danh mục (US-26) */}
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

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon glass">
              <PackageSearch size={40} className="text-muted" />
            </div>
            <h3>Không có sản phẩm nào</h3>
            <p>Vui lòng thêm sản phẩm ở trang Quản lý sản phẩm trước.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const inCart = cart[product.id]?.quantity || 0;
              return (
                <div key={product.id} className={`card product-card ${inCart > 0 ? 'selected' : ''}`} onClick={() => addToCart(product)}>
                  <div className="product-image">
                    <PackageSearch size={32} color="#ccc" />
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <span className="product-price">{product.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {inCart > 0 && (
                    <div className="product-badge">{inCart}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right side: Cart */}
      <div className="pos-cart card">
        <div className="cart-header">
          <h2>Giỏ hàng</h2>
          {cartItems.length > 0 && (
            <button className="btn-icon text-danger" onClick={clearCart}>Làm mới</button>
          )}
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <Receipt size={48} className="text-muted" style={{opacity: 0.3, marginBottom: '1rem'}}/>
              <p>Chưa có sản phẩm nào trong đơn</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <span>{item.product.price.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="item-quantity">
                  <button className="btn-icon small" onClick={() => removeFromCart(item.product.id)}><Minus size={16}/></button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="btn-icon small text-primary" onClick={() => addToCart(item.product)}><Plus size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-summary">
            <span>Tổng tiền:</span>
            <span className="total-amount">{cartTotalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          
          <div className="payment-options">
            <label className="checkbox-label">
              <input type="checkbox" checked={isDebt} onChange={e => setIsDebt(e.target.checked)} />
              Ghi nợ đơn này
            </label>
            
            {!isDebt && (
              <select className="input-field compact" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
              </select>
            )}
          </div>

          <button 
            className="btn-primary btn-checkout" 
            disabled={cartItems.length === 0 || isCheckingOut}
            onClick={handleCheckout}
          >
            {isCheckingOut ? 'ĐANG XỬ LÝ...' : (isDebt ? 'TẠO ĐƠN GHI NỢ' : 'THANH TOÁN')}
          </button>
        </div>
      </div>

      {isInvoiceOpen && lastOrder && (
        <InvoiceModal order={lastOrder} onClose={() => setIsInvoiceOpen(false)} />
      )}
    </div>
  );
}
