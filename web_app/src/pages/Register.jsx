import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Validate email
  const isValidEmail = (e) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(e.trim());
  };

  const isFormValid = isValidEmail(email) && termsAccepted;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/auth/register/email', { email });
      console.log('Register response:', response.data);
      
      // Chuyển sang bước OTP
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Có lỗi xảy ra khi kết nối tới máy chủ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      // Gửi token fake nếu giả lập, token thật nếu có key
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
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-logo">Sổ Bán Hàng</h1>
        <p className="register-subtitle">Đăng ký tài khoản miễn phí</p>

        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Địa chỉ email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={loading || success}
            />
            {email && !isValidEmail(email) && (
              <span className="error-message">Email không hợp lệ</span>
            )}
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={loading || success}
            />
            <label htmlFor="terms">
              Tôi đồng ý với các <a href="#" className="link-text">Điều khoản & Điều kiện</a>
            </label>
          </div>

          {error && <div className="error-message" style={{marginBottom: '16px'}}>{error}</div>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={!isFormValid || loading || success}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="social-login-separator" style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}>
          hoặc đăng ký nhanh bằng
        </div>

        <div className="google-login-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <p className="login-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          Đã có tài khoản? <Link to="/login" className="link-text">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
