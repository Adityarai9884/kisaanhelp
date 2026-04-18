// components/NotificationBell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';

export default function NotificationBell() {
  const [open,   setOpen]   = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await notificationsAPI.mine();
      setNotifs(data.notifications || []);
      setUnread(data.unreadCount   || 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [load]);

  async function markAllRead() {
    try { await notificationsAPI.readAll(); } catch (_) {}
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 8, width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--danger)', color: 'white',
            fontSize: 10, fontWeight: 700,
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 44,
          width: 340, background: 'white',
          border: '1px solid var(--border)', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 500, overflow: 'hidden',
          animation: 'fadeUp 0.2s ease',
        }}>
          <div style={{
            padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>
              Notifications {unread > 0 && <span style={{ color: 'var(--danger)', fontSize: 12 }}>({unread} new)</span>}
            </span>
            {unread > 0 && (
              <span onClick={markAllRead} style={{ fontSize: 12, color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </span>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : notifs.map((n, i) => (
              <div key={n._id || i} style={{
                padding: '13px 18px',
                background: n.read ? 'transparent' : '#F0F9F0',
                borderBottom: '1px solid var(--bg)',
                borderLeft: n.read ? 'none' : '3px solid var(--green)',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
