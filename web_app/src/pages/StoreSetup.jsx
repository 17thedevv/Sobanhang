import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StoreSetup.css';

const INDUSTRIES = [
  { id: 'grocery', name: 'Tạp hóa', icon: '🏪' },
  { id: 'fashion', name: 'Thời trang', icon: '👗' },
  { id: 'fnb', name: 'Nhà hàng, Quán ăn', icon: '🍽️' },
  { id: 'cosmetics', name: 'Mỹ phẩm', icon: '💄' },
  { id: 'electronics', name: 'Điện tử', icon: '💻' },
  { id: 'other', name: 'Ngành khác', icon: '📦' },
];

const StoreSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    role: 'owner',
    name: '',
    industry: '',
    referralCode: ''
  });

  // Ở MVP, ta dùng userId được lưu tạm sau bước Register
  const userId = sessionStorage.getItem('tempUserId');

  useEffect(() => {
    if (!userId) {
      // Nếu chưa có userId, quay lại màn Register
      navigate('/register');
    }
  }, [userId, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isFormValid = formData.name.trim().length >= 3 && formData.industry !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/stores', {
        userId,
        ...formData
      });

      // Lưu tạm ngành hàng để màn Suggestion dùng (MVP)
      sessionStorage.setItem('tempIndustry', formData.industry);
      alert('Tạo cửa hàng thành công!');
      navigate('/suggestions', { state: { industry: formData.industry } });
      
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
    <div className="store-setup-container">
      <div className="store-setup-card">
        <h2>Thiết lập cửa hàng</h2>
        <p>Cung cấp một số thông tin cơ bản về cửa hàng của bạn</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tôi là</label>
            <select 
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              disabled={loading}
            >
              <option value="owner">Chủ cửa hàng</option>
              <option value="staff">Nhân viên</option>
              <option value="partner">Đối tác</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Tên cửa hàng <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              placeholder="VD: Tạp hóa cô Ba"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Mã giới thiệu (Không bắt buộc)</label>
            <input
              type="text"
              placeholder="Nhập mã giới thiệu"
              value={formData.referralCode}
              onChange={(e) => handleChange('referralCode', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px', marginBottom: '24px' }}>
            <label>Ngành hàng kinh doanh <span style={{color: 'red'}}>*</span></label>
            <div className="industry-grid">
              {INDUSTRIES.map(ind => (
                <div 
                  key={ind.id}
                  className={`industry-item ${formData.industry === ind.id ? 'selected' : ''}`}
                  onClick={() => !loading && handleChange('industry', ind.id)}
                >
                  <span className="industry-icon">{ind.icon}</span>
                  <span className="industry-name">{ind.name}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message" style={{marginBottom: '16px'}}>{error}</div>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Đang xử lý...' : 'Hoàn tất'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoreSetup;
