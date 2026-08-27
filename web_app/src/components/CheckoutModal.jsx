import { useState, useEffect } from 'react';
import { X, Search, Plus, User, FileText, CreditCard, Truck, Banknote } from 'lucide-react';
import axios from 'axios';
import './CheckoutModal.css';

export default function CheckoutModal({ 
  onClose, 
  cartItems, 
  cartTotalAmount, 
  onCheckout,
  isCheckingOut 
}) {
  const [customers, setCustomers] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  
  const [cashSources, setCashSources] = useState([]);
  const [selectedCashSourceId, setSelectedCashSourceId] = useState('');

  // Quick add customer form
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchCashSources();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('Lỗi khi tải khách hàng', err);
    }
  };

  const fetchCashSources = async () => {
    try {
      const res = await axios.get('/api/cashbook/sources');
      const sources = res.data.sources || [];
      setCashSources(sources);
      if (sources.length > 0) {
        setSelectedCashSourceId(sources[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi tải sổ quỹ', err);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName) return alert('Vui lòng nhập tên khách hàng');
    try {
      const res = await axios.post('/api/customers', {
        name: newCustomerName,
        phone: newCustomerPhone
      });
      setCustomers([res.data.customer, ...customers]);
      setSelectedCustomerId(res.data.customer.id);
      setIsAddingCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi thêm khách hàng');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || 
    (c.phone && c.phone.includes(searchCustomer))
  );

  const finalTotal = Math.max(0, cartTotalAmount - Number(discount)) + Number(shippingFee);

  const handleAction = (type) => {
    onCheckout({
      type,
      customerId: selectedCustomerId || null,
      discount: Number(discount),
      shippingFee: Number(shippingFee),
      cashSourceId: type === 'QUICK_SALE' ? selectedCashSourceId : null
    });
  };

  return (
    <div className="modal-overlay glass" onClick={onClose}>
      <div className="modal-content checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Xác nhận đơn hàng</h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="checkout-body">
          {/* Left Column: Details & Customer */}
          <div className="checkout-section">
            <div className="section-block">
              <h3><User size={18} /> Khách hàng</h3>
              {!isAddingCustomer ? (
                <div className="customer-selection">
                  <div className="search-bar compact mb-3">
                    <Search size={16} className="text-muted" />
                    <input 
                      type="text" 
                      placeholder="Tìm khách hàng..." 
                      value={searchCustomer}
                      onChange={e => setSearchCustomer(e.target.value)}
                      className="search-input"
                    />
                    <button className="btn-icon small text-primary" onClick={() => setIsAddingCustomer(true)}>
                      <Plus size={16}/>
                    </button>
                  </div>
                  
                  <div className="customer-list">
                    <label className="customer-item">
                      <input 
                        type="radio" 
                        name="customer" 
                        value="" 
                        checked={selectedCustomerId === ''} 
                        onChange={() => setSelectedCustomerId('')}
                      />
                      <div className="customer-info">
                        <strong>Khách lẻ</strong>
                      </div>
                    </label>
                    {filteredCustomers.map(c => (
                      <label key={c.id} className="customer-item">
                        <input 
                          type="radio" 
                          name="customer" 
                          value={c.id} 
                          checked={selectedCustomerId === c.id} 
                          onChange={() => setSelectedCustomerId(c.id)}
                        />
                        <div className="customer-info">
                          <strong>{c.name}</strong>
                          {c.phone && <span className="text-muted text-sm">{c.phone}</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="add-customer-form">
                  <input 
                    type="text" 
                    className="input-field mb-2" 
                    placeholder="Tên khách hàng *" 
                    value={newCustomerName}
                    onChange={e => setNewCustomerName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="input-field mb-3" 
                    placeholder="Số điện thoại" 
                    value={newCustomerPhone}
                    onChange={e => setNewCustomerPhone(e.target.value)}
                  />
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="btn-secondary flex-1" onClick={() => setIsAddingCustomer(false)}>Hủy</button>
                    <button className="btn-primary flex-1" onClick={handleAddCustomer}>Lưu</button>
                  </div>
                </div>
              )}
            </div>

            <div className="section-block mt-4">
              <h3><FileText size={18} /> Chi phí</h3>
              <div className="cost-inputs">
                <div className="input-group">
                  <label>Giảm giá (đ)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={discount} 
                    onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                    min="0"
                  />
                </div>
                <div className="input-group">
                  <label>Phí vận chuyển (đ)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={shippingFee} 
                    onChange={e => setShippingFee(Math.max(0, Number(e.target.value)))}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Actions */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="summary-row">
                <span className="text-muted">Tổng tiền hàng ({cartItems.length} món)</span>
                <span>{cartTotalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Giảm giá</span>
                <span className="text-danger">-{Number(discount).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Phí vận chuyển</span>
                <span>+{Number(shippingFee).toLocaleString('vi-VN')}đ</span>
              </div>
              <hr className="divider" />
              <div className="summary-row final-total">
                <span>Khách cần trả</span>
                <span className="text-primary">{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="payment-source-selector mt-4">
                <label className="text-sm font-medium mb-2" style={{display: 'block'}}>Nguồn tiền (Dành cho Bán nhanh)</label>
                <select 
                  className="form-control"
                  value={selectedCashSourceId}
                  onChange={(e) => setSelectedCashSourceId(e.target.value)}
                >
                  {cashSources.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.balance.toLocaleString()}đ)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="checkout-actions">
              <button 
                className="btn-checkout-action debt-sale" 
                disabled={isCheckingOut || !selectedCustomerId}
                onClick={() => handleAction('DEBT_SALE')}
              >
                <div className="action-icon"><Banknote size={20}/></div>
                <div className="action-text">
                  <strong>Ghi nợ</strong>
                  <span>(Bắt buộc có khách hàng)</span>
                </div>
              </button>
              
              <button 
                className="btn-checkout-action delivery-later" 
                disabled={isCheckingOut}
                onClick={() => handleAction('DELIVERY_LATER')}
              >
                <div className="action-icon"><Truck size={20}/></div>
                <div className="action-text">
                  <strong>Giao sau</strong>
                  <span>Tạo đơn nháp, chưa thu tiền</span>
                </div>
              </button>

              <button 
                className="btn-checkout-action quick-sale" 
                disabled={isCheckingOut}
                onClick={() => handleAction('QUICK_SALE')}
              >
                <div className="action-icon"><CreditCard size={20}/></div>
                <div className="action-text">
                  <strong>Bán nhanh</strong>
                  <span>Thu tiền & Hoàn tất ngay</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
