import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './VerifyOtp.css';

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/verify-reset-otp', {
        email,
        otp
      });
      navigate('/reset-password');
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

  const handleResend = async () => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setError('');
      alert('Đã gửi lại mã OTP');
    } catch (err) {
      setError('Không thể gửi lại mã OTP lúc này');
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <h2>Nhập mã OTP</h2>
        <p className="subtitle">
          Mã khôi phục đã được gửi đến email<br/>
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
            {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
          </button>
        </form>

        <div className="resend-section">
          Chưa nhận được mã? <button onClick={handleResend} className="btn-link">Gửi lại mã</button>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <Link to="/login" className="btn-link" style={{ textDecoration: 'none' }}>Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;
