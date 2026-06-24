import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, 2000);
  }, []);

  // sessionStorage — для toast після window.location / navigate редиректу
  useEffect(() => {
    const success = sessionStorage.getItem('toast');
    if (success) { sessionStorage.removeItem('toast'); addToast(success, 'success'); }
    const error = sessionStorage.getItem('toast_error');
    if (error) { sessionStorage.removeItem('toast_error'); addToast(error, 'error'); }
  }, [addToast]);

  // Кастомна подія — для toast на тій самій сторінці
  useEffect(() => {
    const handler = (e) => addToast(e.detail.message, e.detail.type || 'success');
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type} ${t.hiding ? 'toast--hidden' : 'toast--visible'}`}>
          <span className="toast__icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '!'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
