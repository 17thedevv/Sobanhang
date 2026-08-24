import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './VerifyOtp.css';

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Tự động focus sang ô tiếp theo
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/verify-reset-otp', {
        email,
        otp: otpCode
      });
      // Thành công, cookie resetToken đã được set
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
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <h2>Nhập mã OTP</h2>
          <p>Mã khôi phục đã được gửi đến email</p>
          <span className="phone-highlight">{email}</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-input-container">
            {otp.map((data, index) => {
              return (
                <input
                  className="otp-field"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                />
              );
            })}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
          </button>
        </form>

        <div className="resend-section">
          <p>Chưa nhận được mã?</p>
          <button onClick={handleResend} className="btn-text">Gửi lại mã</button>
        </div>
        
        <p className="login-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login">Quay lại Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyResetOtp;
