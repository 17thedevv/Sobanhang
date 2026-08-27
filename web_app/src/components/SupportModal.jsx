import React from 'react';
import { X, MessageCircle, PhoneCall, MessageSquare, ChevronRight } from 'lucide-react';
import './SupportModal.css';

export default function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content support-modal">
        <div className="modal-header">
          <h3>Trung tâm hỗ trợ</h3>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <p className="support-desc">Bạn cần chúng tôi giúp gì? Đừng ngại chọn một kênh liên hệ nhé!</p>
          
          <div className="support-options">
            <a href="https://zalo.me" target="_blank" rel="noreferrer" className="support-option-card zalo">
              <div className="support-icon-wrapper"><MessageCircle size={28} /></div>
              <div className="support-info">
                <h4>Hỗ trợ qua Zalo</h4>
                <p>Phản hồi trong 5 phút</p>
              </div>
              <ChevronRight className="support-arrow" size={20} />
            </a>
            
            <a href="https://m.me" target="_blank" rel="noreferrer" className="support-option-card messenger">
              <div className="support-icon-wrapper"><MessageSquare size={28} /></div>
              <div className="support-info">
                <h4>Hỗ trợ qua Messenger</h4>
                <p>Phản hồi trong 10 phút</p>
              </div>
              <ChevronRight className="support-arrow" size={20} />
            </a>
            
            <a href="tel:19001560" className="support-option-card hotline">
              <div className="support-icon-wrapper"><PhoneCall size={28} /></div>
              <div className="support-info">
                <h4>Gọi Hotline (Miễn phí)</h4>
                <p>1900 1560 (8:00 - 22:00)</p>
              </div>
              <ChevronRight className="support-arrow" size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
