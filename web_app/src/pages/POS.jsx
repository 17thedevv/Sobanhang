import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Minus, PackageSearch, Receipt } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import CheckoutModal from '../components/CheckoutModal';
import axios from 'axios';
import './POS.css';

export default function POS() {
  const { products, cart, addToCart, removeFromCart, clearCart, cartTotalAmount } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

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

  const handleCheckout = async (payload) => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    try {
      const order = await checkout(payload);
      setLastOrder(order);
      setIsCheckoutModalOpen(false);
      setIsInvoiceOpen(true);
      setIsMobileCartOpen(false); // Close mobile cart if open
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
                    <div className="product-qty-overlay" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon small qty-btn" onClick={() => removeFromCart(product.id)}>
                        <Minus size={16}/>
                      </button>
                      <span className="qty-value">{inCart}</span>
                      <button className="btn-icon small qty-btn" onClick={() => addToCart(product)}>
                        <Plus size={16}/>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar (Mobile/Tablet) */}
      <div className="floating-bottom-bar" onClick={() => setIsMobileCartOpen(true)}>
        <div className="floating-bar-info">
          <span className="item-count">{cartItems.length} sản phẩm</span>
          <span className="total">{cartTotalAmount.toLocaleString('vi-VN')}đ</span>
        </div>
        <div 
          className="floating-bar-action" 
          onClick={(e) => {
            e.stopPropagation();
            if (cartItems.length > 0) setIsCheckoutModalOpen(true);
          }}
        >
          Thanh toán
        </div>
      </div>

      {/* Right side: Cart */}
      <div className={`pos-cart card ${isMobileCartOpen ? 'mobile-open' : ''}`}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-icon mobile-cart-close" onClick={() => setIsMobileCartOpen(false)}>
              <Minus size={20} style={{ transform: 'rotate(90deg)' }} />
            </button>
            <h2>Giỏ hàng</h2>
          </div>
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
          
          <button 
            className="btn-primary btn-checkout" 
            disabled={cartItems.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
          >
            TIẾP TỤC THANH TOÁN
          </button>
        </div>
      </div>

      {isCheckoutModalOpen && (
        <CheckoutModal 
          cartItems={cartItems}
          cartTotalAmount={cartTotalAmount}
          onClose={() => setIsCheckoutModalOpen(false)}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
        />
      )}

      {isInvoiceOpen && lastOrder && (
        <InvoiceModal order={lastOrder} onClose={() => setIsInvoiceOpen(false)} />
      )}
    </div>
  );
}
