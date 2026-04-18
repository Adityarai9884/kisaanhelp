// components/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3400);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 3000,
      background: '#1A2B1A', color: 'white',
      padding: '15px 22px', borderRadius: 12,
      fontSize: 14, fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 10,
      transform: toast ? 'translateY(0)' : 'translateY(90px)',
      opacity: toast ? 1 : 0,
      transition: 'all 0.3s',
      pointerEvents: toast ? 'auto' : 'none',
    }}>
      <span style={{ fontSize: 18 }}>{toast?.icon}</span>
      <span>{toast?.msg}</span>
    </div>
  );
}
