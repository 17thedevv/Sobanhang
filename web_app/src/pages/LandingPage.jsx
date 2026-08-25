import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon">$</span>
          SoBanHang
        </Link>
        
        <nav className="landing-nav">
          <a href="#san-pham">Sản phẩm ⌄</a>
          <a href="#giai-phap">Giải pháp ⌄</a>
          <a href="#bang-gia">Bảng giá</a>
          <a href="#blog">Blog ⌄</a>
          <a href="#thong-tin-thue">Thông tin thuế</a>
          <a href="#ve-chung-toi">Về chúng tôi</a>
        </nav>

        <div className="landing-auth-buttons">
          <Link to="/login" className="btn-login">Đăng nhập</Link>
          <Link to="/register" className="btn-register">Đăng ký</Link>
        </div>
      </header>

      <main className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">Kinh doanh bứt phá, thuế khoá an tâm</h1>
          <p className="hero-subtitle">
            Đồng hành cùng Hộ kinh doanh thích ứng linh hoạt trước mọi thay đổi về thuế và pháp lý
          </p>
          
          <ul className="hero-features">
            <li>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Số hoá tuân thủ - cập nhật nhanh về các sự thay đổi về Thuế
            </li>
            <li>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Minh bạch và Tối ưu hoá nghĩa vụ Thuế
            </li>
            <li>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Chuẩn hoá dữ liệu để bứt phá kinh doanh
            </li>
          </ul>

          <div className="hero-actions">
            <Link to="/register" className="btn-download">
              Tải app 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#learn-more" className="btn-learn-more">Tìm hiểu thêm</a>
          </div>

          <div className="hero-stores">
            <a href="#" className="store-btn">
              <span className="store-icon"></span>
              <div className="store-text">
                <small>Tải về trên</small>
                <strong>App Store</strong>
              </div>
            </a>
            <a href="#" className="store-btn">
              <span className="store-icon">▶</span>
              <div className="store-text">
                <small>Tải về trên</small>
                <strong>Google Play</strong>
              </div>
            </a>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
            alt="Sổ Bán Hàng Dashboard App" 
            className="hero-image"
          />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
