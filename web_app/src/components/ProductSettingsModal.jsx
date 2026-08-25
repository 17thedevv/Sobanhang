import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import axios from 'axios';
import './ProductSettingsModal.css';

const DEFAULT_SETTINGS = {
  // Thông tin chung
  showImage: true,
  showUnit: true,
  showUnitConversion: false,
  showDescription: true,
  showSuggested: false,
  // Giá sản phẩm
  showPromotionalPrice: true,
  showWholesalePrice: true,
  // Tồn kho
  showTrackInventory: true,
  showBarcode: true,
  // Thông tin khác
  showUpsell: false,
  showVariants: true,
  showWebSettings: false,
  showProductLabels: false,
};

export default function ProductSettingsModal({ isOpen, onClose, onSave }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load settings from store
      axios.get('/api/stores/settings')
        .then(res => {
          if (res.data.productSettings) {
            setSettings(prev => ({ ...prev, ...res.data.productSettings }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/stores/settings', { productSettings: settings });
      if (onSave) onSave(settings);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const ToggleRow = ({ label, settingKey, description }) => (
    <div className="setting-row">
      <div className="setting-info">
        <span className="setting-label">{label}</span>
        {description && <span className="setting-desc">{description}</span>}
      </div>
      <label className="switch">
        <input type="checkbox" checked={settings[settingKey]} onChange={() => toggle(settingKey)} />
        <span className="slider round"></span>
      </label>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Settings size={20} /> Cài đặt sản phẩm</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body-scroll">
          {/* Nhóm 1: Thông tin chung */}
          <div className="settings-group">
            <h3 className="settings-group-title">Thông tin chung</h3>
            <ToggleRow label="Hình ảnh" settingKey="showImage" description="Hiển thị ảnh sản phẩm" />
            <ToggleRow label="Đơn vị SP" settingKey="showUnit" description="Đơn vị tính (Cái, Hộp...)" />
            <ToggleRow label="Đơn vị quy đổi" settingKey="showUnitConversion" description="VD: 1 Lốc = 6 Lon" />
            <ToggleRow label="Mô tả" settingKey="showDescription" description="Nội dung giới thiệu sản phẩm" />
            <ToggleRow label="Gợi ý SP" settingKey="showSuggested" description="Gợi ý sản phẩm tương tự" />
          </div>

          {/* Nhóm 2: Giá sản phẩm */}
          <div className="settings-group">
            <h3 className="settings-group-title">Giá sản phẩm</h3>
            <ToggleRow label="Giá khuyến mãi" settingKey="showPromotionalPrice" description="Giá giảm hiển thị bên cạnh giá gốc" />
            <ToggleRow label="Giá sỉ" settingKey="showWholesalePrice" description="Giá theo bậc số lượng mua" />
          </div>

          {/* Nhóm 3: Tồn kho */}
          <div className="settings-group">
            <h3 className="settings-group-title">Tồn kho</h3>
            <ToggleRow label="Theo dõi tồn kho" settingKey="showTrackInventory" description="Bật/tắt quản lý số lượng tồn" />
            <ToggleRow label="Mã vạch" settingKey="showBarcode" description="Mã vạch/QR code" />
          </div>

          {/* Nhóm 4: Thông tin khác */}
          <div className="settings-group">
            <h3 className="settings-group-title">Thông tin khác</h3>
            <ToggleRow label="Sản phẩm bán kèm (Upsell)" settingKey="showUpsell" description="Gợi ý bán kèm khi thanh toán" />
            <ToggleRow label="Phân loại/Biến thể" settingKey="showVariants" description="Màu sắc, Size, Kích thước..." />
            <ToggleRow label="Hiển thị trên Website" settingKey="showWebSettings" description="Bán online trên web sổ bán hàng" />
            <ToggleRow label="Gắn nhãn SP" settingKey="showProductLabels" description="Nhãn nổi bật (Hot, Mới...)" />
          </div>
        </div>

        <div className="modal-footer-fixed">
          <button className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
}
