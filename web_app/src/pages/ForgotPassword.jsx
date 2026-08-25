import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Tận dụng style của màn Login cho nhanh gọn và đồng nhất

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      console.log('Forgot password response:', response.data);
      // Thành công thì chuyển sang màn nhập OTP, truyền email qua state
      navigate('/verify-reset-otp', { state: { email } });
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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Quên mật khẩu</h2>
          <p>Nhập email của bạn để nhận mã khôi phục</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !email}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'Đang gửi mã...' : 'Nhận mã OTP'}
          </button>
        </form>

        <p className="register-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login">Quay lại Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
