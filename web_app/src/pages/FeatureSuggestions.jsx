import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './FeatureSuggestions.css';

const FeatureSuggestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lấy industry từ state (được truyền từ StoreSetup) hoặc localStorage
  const industry = location.state?.industry || sessionStorage.getItem('tempIndustry') || 'grocery';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/onboarding/suggestions?industry=${industry}`);
        const data = response.data.suggestions;
        setSuggestions(data);
        
        // Mặc định chọn những tính năng được gợi ý
        const initialSelected = new Set();
        data.forEach(item => {
          if (item.isRecommended) {
            initialSelected.add(item.id);
          }
        });
        setSelectedFeatures(initialSelected);
      } catch (err) {
        setError('Không thể tải gợi ý tính năng');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [industry]);

  const toggleFeature = (id) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFeatures(newSelected);
  };

  const handleContinue = async () => {
    // Theo MVP, chúng ta có thể không cần lưu các lựa chọn này vào Database,
    // nhưng ta giả lập thời gian xử lý một chút.
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      // TODO: Chuyển sang US-06 (Cách làm quen)
      alert('Đã lưu cấu hình tính năng! (Sẵn sàng sang US-06)');
      // navigate('/preference');
    }, 500);
  };

  if (loading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card center-text">
          <p>Đang chuẩn bị gợi ý tính năng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Công cụ dành cho bạn</h2>
        <p className="subtitle">Dựa trên ngành hàng, chúng tôi gợi ý các công cụ sau để giúp bạn quản lý tốt hơn.</p>

        {error && <div className="error-message">{error}</div>}

        <div className="feature-list">
          {suggestions.map((feature) => (
            <div 
              key={feature.id} 
              className={`feature-item ${selectedFeatures.has(feature.id) ? 'selected' : ''}`}
              onClick={() => toggleFeature(feature.id)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-info">
                <span className="feature-name">{feature.name}</span>
                {feature.isRecommended && <span className="badge">Khuyên dùng</span>}
              </div>
              <div className="checkbox">
                {selectedFeatures.has(feature.id) ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>

        <button 
          className="btn-primary" 
          onClick={handleContinue}
          disabled={submitting}
        >
          {submitting ? 'Đang xử lý...' : 'Tiếp tục'}
        </button>
      </div>
    </div>
  );
};

export default FeatureSuggestions;
