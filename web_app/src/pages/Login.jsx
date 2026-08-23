import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (phone) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-circle large">SB</div>
          <h1>Sổ Bán Hàng</h1>
          <p>Quản lý bán hàng dễ dàng, thông minh</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="label">Số điện thoại</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="Nhập số điện thoại của bạn"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </div>
          
          <button type="submit" className="btn-primary login-btn">
            Tiếp tục
          </button>
        </form>
      </div>
    </div>
  );
}
