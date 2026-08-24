import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import './SetPassword.css';

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/set-password', {
        password
      });
      
      // Xoá mọi state rác nếu có
      sessionStorage.removeItem('tempIndustry');
      
      // Thành công, cookie HTTPOnly đã được ghi nhận. Sang thẳng Dashboard.
      navigate('/dashboard');
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        if (err.response.status === 401) {
          // Token cài đặt đã hết hạn hoặc không có
          setTimeout(() => navigate('/register'), 2000);
        } else if (err.response.status === 403) {
          // Đã setup xong rồi
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError('Có lỗi xảy ra khi kết nối máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-password-container">
      <div className="set-password-card">
        <div className="icon-wrapper">
          <Lock size={32} />
        </div>
        <h2>Bảo mật tài khoản</h2>
        <p className="subtitle">Tạo mật khẩu để bảo vệ cửa hàng của bạn. Mật khẩu cần có ít nhất 8 ký tự.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật khẩu <span className="required">*</span></label>
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

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Xác nhận mật khẩu <span className="required">*</span></label>
            <div className="input-with-icon">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                disabled={loading}
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !password || !confirmPassword}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'Đang thiết lập...' : 'Hoàn tất Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
