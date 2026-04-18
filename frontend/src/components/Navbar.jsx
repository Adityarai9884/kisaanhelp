// components/Navbar.jsx
import React from 'react';

const navbarStyle = {
  position: 'fixed', top: 0, width: '100%', zIndex: 1000,
  background: 'rgba(247,245,240,0.93)',
  backdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--border)',
  padding: '0 32px',
  height: 'var(--navbar-h)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};

export default function Navbar({ currentPage, currentUser, onNav, onLogin, onRegister, onLogout }) {
  const links = [
    { id: 'landing',   label: 'Home'      },
    { id: 'market',    label: 'Market'    },
    { id: 'ai-price',  label: '🤖 AI Price' },
    { id: 'weather',   label: '🌤️ Weather' },
    { id: 'transport', label: 'Transport' },
    { id: 'uid',       label: 'Smart ID'  },
  ];

  return (
    <nav style={navbarStyle}>
      {/* Brand */}
      <div
        onClick={() => onNav('landing')}
        style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800,
                 color: 'var(--green)', display: 'flex', alignItems: 'center',
                 gap: 10, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 28 }}>🌿</span> AgriSmart
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 6 }}>
        {links.map(l => (
          <span
            key={l.id}
            onClick={() => onNav(l.id)}
            style={{
              padding: '8px 16px', borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              color: currentPage === l.id ? 'var(--green)' : 'var(--muted)',
              background: currentPage === l.id ? 'var(--green-pale)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            {l.label}
          </span>
        ))}
      </div>

      {/* Right actions */}
      {currentUser ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700,
                         color: 'var(--green)' }}>{currentUser.uid}</span>
          <button className="btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary btn-sm" onClick={onLogin}>Login</button>
          <button className="btn-primary btn-sm" onClick={onRegister}>Register Free</button>
        </div>
      )}
    </nav>
  );
}
