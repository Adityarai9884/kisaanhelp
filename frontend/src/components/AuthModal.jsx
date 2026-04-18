// components/AuthModal.jsx
import React, { useState } from 'react';

const ROLES = [
  { name: 'Farmer',    code: 'FR', icon: '👨‍🌾' },
  { name: 'Wholesaler',code: 'WH', icon: '🏪' },
  { name: 'Buyer',     code: 'BY', icon: '🛒' },
  { name: 'Incharge',  code: 'IN', icon: '👮' },
  { name: 'Admin',     code: 'AD', icon: '⚙️' },
];
const DISTRICTS = ['Ayodhya', 'Mathura', 'Agra', 'Delhi'];

export default function AuthModal({ mode, onClose, onLogin, onRegister }) {
  const [tab,      setTab]      = useState(mode || 'login');
  const [selRole,  setSelRole]  = useState(ROLES[0]);
  const [uid,      setUid]      = useState('');
  const [mobile,   setMobile]   = useState('');
  const [name,     setName]     = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [busy,     setBusy]     = useState(false);

  async function handleLogin() {
    if (!password) return;
    setBusy(true);
    try {
      await onLogin({ uid: uid.trim() || undefined, mobile: mobile.trim() || undefined, password });
    } finally { setBusy(false); }
  }

  async function handleRegister() {
    if (!name || !mobile || !password || !district) return;
    setBusy(true);
    try {
      await onRegister({
        name, mobile, password,
        role:     selRole.name.toLowerCase(),
        district,
      });
    } finally { setBusy(false); }
  }

  const overlay = {
    position:'fixed', inset:0,
    background:'rgba(0,0,0,0.5)',
    backdropFilter:'blur(4px)',
    zIndex:2000,
    display:'flex', alignItems:'center', justifyContent:'center',
  };

  const modal = {
    background:'white', borderRadius:20,
    width:430, padding:'36px 38px',
    boxShadow:'0 24px 80px rgba(0,0,0,0.2)',
    position:'relative',
    animation:'fadeUp 0.28s ease',
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:14,
          background:'none', border:'none', fontSize:18,
          cursor:'pointer', color:'var(--muted)',
          width:32, height:32, borderRadius:8,
        }}>✕</button>

        <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, color:'var(--green)', marginBottom:4 }}>
          🌿 AgriSmart
        </div>
        <div style={{ fontSize:13, color:'var(--muted)', marginBottom:22 }}>
          Access the Digital Mandi Platform
        </div>

        <div style={{
          display:'flex', gap:4,
          background:'var(--bg)', borderRadius:10, padding:4, marginBottom:22,
        }}>
          {['login','register'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex:1, textAlign:'center', padding:'9px',
              borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer',
              color: tab===t ? 'var(--green)' : 'var(--muted)',
              background: tab===t ? 'white' : 'transparent',
              boxShadow: tab===t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition:'all 0.18s', textTransform:'capitalize',
            }}>{t}</div>
          ))}
        </div>

        {tab === 'login' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <input className="form-input" placeholder="AgriSmart ID (e.g. FRAY0001)"
              value={uid} onChange={e => setUid(e.target.value)} />
            <input className="form-input" placeholder="or Mobile Number"
              value={mobile} onChange={e => setMobile(e.target.value)} />
            <input className="form-input" type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <button className="btn-primary" style={{ width:'100%', padding:14, opacity: busy?0.7:1 }}
              onClick={handleLogin} disabled={busy}>
              {busy ? 'Logging in...' : 'Login to Dashboard'}
            </button>
            <div style={{ textAlign:'center', fontSize:12, color:'var(--muted)' }}>
              Demo: enter any UID + any password to test
            </div>
          </div>
        )}

        {tab === 'register' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div className="form-label" style={{ marginBottom:8 }}>Select Your Role</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {ROLES.map(r => (
                  <div key={r.code} onClick={() => setSelRole(r)} style={{
                    border:`1.5px solid ${selRole.code===r.code ? 'var(--green)' : 'var(--border)'}`,
                    background: selRole.code===r.code ? 'var(--green-pale)' : 'transparent',
                    color: selRole.code===r.code ? 'var(--green)' : 'var(--muted)',
                    borderRadius:10, padding:'11px 8px', textAlign:'center',
                    cursor:'pointer', fontSize:12, fontWeight:600, transition:'all 0.18s',
                  }}>
                    <div style={{ fontSize:22, marginBottom:5 }}>{r.icon}</div>
                    {r.name}
                  </div>
                ))}
              </div>
            </div>
            <input className="form-input" placeholder="Full Name"
              value={name} onChange={e => setName(e.target.value)} />
            <input className="form-input" type="tel" placeholder="Mobile Number"
              value={mobile} onChange={e => setMobile(e.target.value)} />
            <select className="form-select" value={district} onChange={e => setDistrict(e.target.value)}>
              <option value="">Select District</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="form-input" type="password" placeholder="Create Password"
              value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn-primary" style={{ width:'100%', padding:14, opacity:busy?0.7:1 }}
              onClick={handleRegister} disabled={busy}>
              {busy ? 'Creating account...' : 'Create Account & Get ID'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
