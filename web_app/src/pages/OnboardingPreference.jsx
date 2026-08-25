import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, CalendarCheck, Compass } from 'lucide-react';
import './OnboardingPreference.css';

const preferences = [
  {
    id: 'CONSULT_NOW',
    title: 'Tôi muốn tư vấn ngay',
    description: 'Gọi ngay cho chúng tôi để được hướng dẫn trực tiếp từ chuyên viên.',
    icon: <PhoneCall size={32} />
  },
  {
    id: 'SCHEDULE',
    title: 'Đặt lịch hẹn',
    description: 'Chọn thời gian rảnh của bạn, chúng tôi sẽ gọi lại hỗ trợ.',
    icon: <CalendarCheck size={32} />
  },
  {
    id: 'SELF_EXPLORE',
    title: 'Tự khám phá Cửa Hàng Số',
    description: 'Tự do trải nghiệm ứng dụng, xem tài liệu hướng dẫn có sẵn.',
    icon: <Compass size={32} />
  }
];

const OnboardingPreference = () => {
  const navigate = useNavigate();
  const [selectedPref, setSelectedPref] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedPref) {
      setError('Vui lòng chọn một cách làm quen!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/onboarding/preference', {
        preference: selectedPref
      });
      
      // Thành công, chuyển tiếp sang bước tạo mật khẩu
      navigate('/set-password');
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        if (err.response.status === 403) {
          // Bị từ chối vì đã hoàn tất Onboarding
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card preference-card">
        <h2>Bạn muốn làm quen với Cửa Hàng Số như thế nào?</h2>
        <p className="subtitle">Lựa chọn cách tốt nhất để chúng tôi hỗ trợ bạn.</p>

        {error && <div className="error-message">{error}</div>}

        <div className="preference-list">
          {preferences.map(pref => (
            <div 
              key={pref.id}
              className={`preference-item ${selectedPref === pref.id ? 'active' : ''}`}
              onClick={() => setSelectedPref(pref.id)}
            >
              <div className="pref-icon">{pref.icon}</div>
              <div className="pref-content">
                <h3>{pref.title}</h3>
                <p>{pref.description}</p>
              </div>
              <div className="radio-circle">
                {selectedPref === pref.id && <div className="radio-inner" />}
              </div>
            </div>
          ))}
        </div>

        <button 
          className="btn-primary" 
          onClick={handleSubmit} 
          disabled={loading || !selectedPref}
        >
          {loading ? 'Đang xử lý...' : 'Hoàn tất'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPreference;
