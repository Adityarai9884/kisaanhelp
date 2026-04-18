// pages/incharge/InchargeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { transportAPI, mandiAPI } from '../../services/api';
import { GATE_ARRIVALS, MANDI_RATES } from '../../data/mockData';

const NAV = [
  { id:'overview', icon:'📊', label:'Overview'        },
  { id:'gate',     icon:'🚪', label:'Gate Entry'      },
  { id:'rates',    icon:'💰', label:'Daily Rates'     },
  { id:'stock',    icon:'📦', label:'Stock Inventory' },
];

const STOCK = [
  { crop:'Wheat',   qty:180, farmers:'FRAY0001, FRAY0012', date:'Apr 1, 2026',  status:'active'  },
  { crop:'Rice',    qty:200, farmers:'FRAY0089',           date:'Mar 31, 2026', status:'active'  },
  { crop:'Mustard', qty:102, farmers:'FRAY0034, FRAY0056', date:'Apr 1, 2026',  status:'pending' },
];

export default function InchargeDashboard({ user, onToast, onLogout }) {
  const [panel,    setPanel]   = useState('overview');
  const [arrivals, setArrivals] = useState(GATE_ARRIVALS);
  const [rates,    setRates]   = useState(MANDI_RATES);

  useEffect(() => {
    transportAPI.arrivals()
      .then(data => { if (data.length) setArrivals(data); })
      .catch(() => {});
    if (user?.district) {
      mandiAPI.rates(user.district)
        .then(data => { if (data.length) setRates(data.map(r => ({ crop: r.crop, price: r.price }))); })
        .catch(() => {});
    }
  }, [user]);

  async function approve(id) {
    try {
      await transportAPI.approve(id);
    } catch (_) {}
    setArrivals(a => a.map(x => (x._id || x.id) === id ? { ...x, status:'approved' } : x));
    onToast('✅', `Gate entry approved for ${id}`);
  }

  async function reject(id) {
    try {
      await transportAPI.reject(id);
    } catch (_) {}
    setArrivals(a => a.map(x => (x._id || x.id) === id ? { ...x, status:'rejected' } : x));
    onToast('❌', `Entry rejected for ${id}`);
  }

  async function publishRates() {
    try {
      await mandiAPI.publishRates(user?.district || 'Delhi', rates);
      onToast('✅', 'Daily rates published!');
    } catch (_) {
      onToast('✅', 'Rates saved (backend not connected)');
    }
  }

  const statusStyle = {
    active:   { background:'var(--green-pale)', color:'var(--green)' },
    pending:  { background:'var(--gold-light)',  color:'#6D4C00'     },
    approved: { background:'var(--green-pale)', color:'var(--green)' },
    rejected: { background:'var(--danger-light)', color:'var(--danger)' },
    waiting:  { background:'var(--gold-light)', color:'#6D4C00'     },
  };

  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800 }}>👮 Mandi Incharge Dashboard</div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>{user?.name || 'Vijay Singh'}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{user?.uid || 'INDL0005'} · Delhi</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#6A1B9A', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>VS</div>
          <button className="btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 128px)' }}>
        <div className="dash-sidebar">
          {NAV.map(item => (
            <div key={item.id} className={`nav-item${panel === item.id ? ' active' : ''}`} onClick={() => setPanel(item.id)}>
              <span className="nav-icon">{item.icon}</span> {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding:32, background:'var(--bg)' }}>

          {panel === 'overview' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>Mandi Operations · Today</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                {[
                  { label:'Arrivals Today',  value:'14',      change:'↑ 3 pending',   c:'up'  },
                  { label:'Current Stock',   value:'482 Qtl', change:'',              c:''    },
                  { label:'Transactions',    value:'₹12.4L',  change:'↑ Today\'s vol',c:'up'  },
                  { label:'Pending Gate',    value:'3',       change:'Awaiting approval', c:'warn' },
                ].map((s,i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    {s.change && <div className={`stat-change change-${s.c}`}>{s.change}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {panel === 'gate' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:20 }}>Gate Entry Management</div>
              <div className="card">
                <div className="card-head"><span className="card-title">Pending Arrivals</span></div>
                <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {arrivals.map(a => (
                    <div key={a.id} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'15px 18px', background:'var(--bg)', borderRadius:12,
                      border:'1px solid var(--border)',
                      opacity: a.status !== 'waiting' ? 0.55 : 1,
                      transition:'opacity 0.3s',
                    }}>
                      <div>
                        <div style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, color:'var(--green)' }}>{a.id}</div>
                        <div style={{ fontSize:13, color:'var(--muted)', marginTop:3 }}>{a.crop} · {a.qty} · {a.vehicle} · {a.time}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span className="pill" style={statusStyle[a.status]}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span>
                        {a.status === 'waiting' && (
                          <>
                            <button className="btn-primary btn-sm" onClick={() => approve(a._id || a.id)}>✓ Approve</button>
                            <button className="btn-danger btn-sm" onClick={() => reject(a._id || a.id)}>✕ Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {panel === 'rates' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:20 }}>Daily Rate Management</div>
              <div className="card">
                <div className="card-body">
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                    {rates.map((r, i) => (
                      <div key={r.crop} className="card" style={{ padding:20 }}>
                        <div style={{ fontWeight:700, marginBottom:10 }}>{r.crop}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:13, color:'var(--muted)' }}>₹</span>
                          <input
                            className="form-input"
                            type="number"
                            value={r.price}
                            onChange={e => setRates(prev => prev.map((x,j) => j === i ? { ...x, price: Number(e.target.value) } : x))}
                            style={{ flex:1, fontFamily:'var(--font-head)', fontWeight:700, fontSize:18 }}
                          />
                          <span style={{ fontSize:12, color:'var(--muted)' }}>/qtl</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ marginTop:24 }} onClick={publishRates}>
                    Publish Today's Rates
                  </button>
                </div>
              </div>
            </div>
          )}

          {panel === 'stock' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:20 }}>Mandi Stock Inventory</div>
              <div className="card">
                <div className="card-body">
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Stock (Qtl)</th><th>Farmer IDs</th><th>Arrival Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {STOCK.map((s,i) => (
                        <tr key={i}>
                          <td style={{ fontWeight:600 }}>{s.crop}</td>
                          <td style={{ fontWeight:700, fontFamily:'var(--font-head)' }}>{s.qty}</td>
                          <td style={{ color:'var(--green)', fontFamily:'var(--font-head)', fontSize:13, fontWeight:700 }}>{s.farmers}</td>
                          <td style={{ fontSize:13 }}>{s.date}</td>
                          <td><span className="pill" style={{ background:'var(--green-pale)', color:'var(--green)' }}>In Stock</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
