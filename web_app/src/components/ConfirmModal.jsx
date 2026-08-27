import React from 'react';
import { X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title = 'Xác nhận', 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  isDanger = true 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay glass" onClick={onCancel}>
      <div className="modal-content card small-modal confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header border-0">
          <h3 className={isDanger ? 'text-danger' : ''}>{title}</h3>
          <button className="btn-icon" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button 
            className="btn-primary" 
            style={isDanger ? { backgroundColor: 'var(--danger)' } : {}}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
