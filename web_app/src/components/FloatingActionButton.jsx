import React, { useState } from 'react';
import { Plus, X, ShoppingCart, ScanLine, UserPlus, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FloatingActionButton.css';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="fab-container">
      {isOpen && (
        <div className="fab-menu">
          <div className="fab-item" onClick={() => { navigate('/dashboard/pos'); setIsOpen(false); }}>
            <span className="fab-label">Tạo đơn hàng</span>
            <div className="fab-icon-sm bg-green"><ShoppingCart size={18} color="white" /></div>
          </div>
          <div className="fab-item" onClick={() => { alert('Quét mã vạch'); setIsOpen(false); }}>
            <span className="fab-label">Quét mã vạch</span>
            <div className="fab-icon-sm bg-blue"><ScanLine size={18} color="white" /></div>
          </div>
          <div className="fab-item" onClick={() => { alert('Thêm khách hàng'); setIsOpen(false); }}>
            <span className="fab-label">Thêm khách hàng</span>
            <div className="fab-icon-sm bg-yellow"><UserPlus size={18} color="white" /></div>
          </div>
          <div className="fab-item" onClick={() => { navigate('/dashboard/products'); setIsOpen(false); }}>
            <span className="fab-label">Thêm sản phẩm</span>
            <div className="fab-icon-sm bg-purple"><PackagePlus size={18} color="white" /></div>
          </div>
        </div>
      )}
      <button className={`fab-main-btn ${isOpen ? 'open' : ''}`} onClick={toggleOpen}>
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
