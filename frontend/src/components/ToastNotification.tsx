import React, { useEffect } from 'react';
import type { StatusState } from '../types';

interface ToastNotificationProps {
  status: StatusState;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ status, onClose }) => {
  useEffect(() => {
    if (!status.message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [status.message, onClose]);

  if (!status.message) return null;

  const isSuccess = status.type === 'success';

  return (
    <div className={`toast-container ${isSuccess ? 'toast-success' : 'toast-error'}`} role="alert">
      <div className="toast-icon">
        {isSuccess ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>
      <p className="toast-message">{status.message}</p>
      <button type="button" className="toast-close-btn" onClick={onClose} aria-label="Cerrar notificación">
        ✕
      </button>
    </div>
  );
};
