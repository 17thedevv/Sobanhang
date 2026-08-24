import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      // Cookie accessToken đã được set tự động (HttpOnly)
      // Kiểm tra xem backend trả về gì
      if (response.data.setupToken) {
        // Tài khoản đang cài đặt dở
        navigate('/store-setup');
      } else {
        // Login thành công
        navigate('/');
      }
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const idToken = credentialResponse.credential || 'mock_google_token';
      
      const response = await axios.post('/api/auth/google', { idToken });
      
      if (response.data.setupToken) {
        navigate('/store-setup');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Đăng nhập Google thất bại');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại (Error from Google)');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Đăng nhập Sổ Bán Hàng</h2>
        <p className="subtitle">Quản lý bán hàng dễ dàng và tiện lợi</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
            disabled={loading || !email || !password}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="social-login-separator" style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}>
          hoặc
        </div>

        <div className="google-login-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>

        <div className="register-section" style={{ marginTop: '20px' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
