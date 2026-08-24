import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyOtp.css';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!email) {
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/verify-otp', {
        email,
        otp
      });
      
      // Token (setupToken) đã được gài vào HttpOnly Cookie
      // Chuyển thẳng sang bước tạo shop
      navigate('/store-setup');
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Có lỗi xảy ra khi xác thực OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <h2>Nhập mã xác thực</h2>
        <p className="subtitle">
          Mã xác thực 6 số đã được gửi tới email<br/>
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nhập mã OTP (6 số)"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 6) {
                  setOtp(val);
                  setError('');
                }
              }}
              disabled={loading}
              className="otp-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Đang xác thực...' : 'Tiếp tục'}
          </button>
        </form>

        <div className="resend-section">
          Chưa nhận được mã? <button className="btn-link">Gửi lại mã</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
