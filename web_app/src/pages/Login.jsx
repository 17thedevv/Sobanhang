import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phone || !password) {
      setError('Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/login', {
        phone,
        password
      });
      
      // Cookie accessToken đã được set tự động (HttpOnly)
      navigate('/dashboard');
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        if (err.response.status === 403) {
          // Chưa cài đặt mật khẩu
          setTimeout(() => navigate('/register'), 2000);
        }
      } else {
        setError('Có lỗi xảy ra khi đăng nhập');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Đăng nhập Sổ Bán Hàng</h2>
        <p className="subtitle">Quản lý bán hàng dễ dàng và tiện lợi</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={loading}
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !phone || !password}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="register-section">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
