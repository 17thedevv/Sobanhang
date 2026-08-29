import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 5000),
    warning: (msg) => addToast(msg, 'warning', 4000),
    info: (msg) => addToast(msg, 'info'),
  }, [addToast]);

  // Fix: toast needs to be a plain object with methods
  const toastApi = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 5000),
    warning: (msg) => addToast(msg, 'warning', 4000),
    info: (msg) => addToast(msg, 'info'),
  };

  const iconMap = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const colorMap = {
    success: { bg: '#e6f7ec', border: '#00B14F', text: '#00863b', icon: '#00B14F' },
    error:   { bg: '#fdecea', border: '#d32f2f', text: '#b71c1c', icon: '#d32f2f' },
    warning: { bg: '#fff8e1', border: '#f9a825', text: '#e65100', icon: '#f9a825' },
    info:    { bg: '#e8f4fd', border: '#1976d2', text: '#0d47a1', icon: '#1976d2' },
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 420,
        width: '100%',
      }}>
        {toasts.map((t) => {
          const colors = colorMap[t.type] || colorMap.info;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 18px',
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                color: colors.text,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.5,
                pointerEvents: 'auto',
                animation: 'toastSlideIn 0.3s ease-out',
                position: 'relative',
              }}
            >
              <span style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }}>
                {iconMap[t.type]}
              </span>
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: colors.text,
                  opacity: 0.6,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(80px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
