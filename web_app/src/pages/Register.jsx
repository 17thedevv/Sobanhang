import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Validate Vietnamese phone number
  const isValidPhone = (p) => {
    const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return regex.test(p.trim().replace(/\s/g, ''));
  };

  const isFormValid = isValidPhone(phone) && termsAccepted;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register/phone', {
        phone: phone
      });

      // Ở MVP, ta dùng userId được lưu tạm
      if (response.data && response.data.userId) {
        sessionStorage.setItem('tempUserId', response.data.userId);
      }

      setSuccess('Đăng ký thành công! Đang chuyển hướng thiết lập cửa hàng...');
      
      setTimeout(() => {
        navigate('/store-setup');
      }, 1500);

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

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-logo">Sổ Bán Hàng</h1>
        <p className="register-subtitle">Đăng ký tài khoản miễn phí</p>

        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              placeholder="Nhập số điện thoại (VD: 0912345678)"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              disabled={loading || success}
            />
            {phone && !isValidPhone(phone) && (
              <span className="error-message">Số điện thoại không hợp lệ</span>
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

        <div className="login-link">
          Đã có tài khoản? <Link to="/login" className="link-text">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
