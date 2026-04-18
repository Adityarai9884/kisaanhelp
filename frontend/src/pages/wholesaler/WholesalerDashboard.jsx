// pages/wholesaler/WholesalerDashboard.jsx — Phase 3
import React, { useState, useEffect } from 'react';
import OrderCard        from '../../components/OrderCard';
import NotificationBell from '../../components/NotificationBell';
import { cropsAPI, ordersAPI } from '../../services/api';
import { CROPS } from '../../data/mockData';

const NAV = [
  { id:'overview', icon:'📊', label:'Overview'      },
  { id:'browse',   icon:'🔍', label:'Browse Market' },
  { id:'myorders', icon:'📦', label:'My Orders', badge:true },
  { id:'demand',   icon:'📈', label:'Demand Alerts', section:'Analytics' },
];

export default function WholesalerDashboard({ user, onToast, onLogout }) {
  const [panel,   setPanel]  = useState('overview');
  const [crops,   setCrops]  = useState([]);
  const [orders,  setOrders] = useState([]);
  const [search,  setSearch] = useState('');
  const [district,setDistrict]=useState('');
  const [qty,     setQty]    = useState({});
  const [busy,    setBusy]   = useState(null);

  useEffect(() => {
    cropsAPI.list().then(d => setCrops(d.crops || d || CROPS)).catch(()=> setCrops(CROPS));
    loadOrders();
  }, []);

  async function loadOrders() {
    try { const d = await ordersAPI.mine(); setOrders(d || []); } catch(_) {}
  }

  const displayed = crops.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) &&
    (!district || c.district === district)
  );

  async function placeOrder(crop) {
    const quantity = Number(qty[crop._id || crop.id] || 1);
    if (!quantity || quantity <= 0) { onToast('⚠️','Enter a valid quantity'); return; }
    setBusy(crop._id || crop.id);
    try {
      await ordersAPI.place({ cropId: crop._id, quantity, buyerNote: '' });
      onToast('🛒', `Order placed for ${quantity} qtl of ${crop.name}!`);
      loadOrders();
    } catch(err) {
      onToast('⚠️', err.message || 'Demo: order saved locally');
    } finally { setBusy(null); }
  }

  async function handleCancel(orderId) {
    try { await ordersAPI.cancel(orderId); onToast('❌','Order cancelled'); loadOrders(); }
    catch(err) { onToast('❌', err.message); }
  }

  const pendingCount = orders.filter(o=>o.status==='pending').length;

  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800 }}>🏪 Wholesaler Dashboard</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <NotificationBell />
          <div><div style={{ fontSize:14, fontWeight:600 }}>{user?.name || 'Suresh Agarwal'}</div><div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{user?.uid || 'WHMT0512'} · {user?.district||'Mathura'}</div></div>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#0277BD', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>
            {(user?.name||'SA').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <button className="btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 128px)' }}>
        <div className="dash-sidebar">
          {NAV.map(item => (
            <React.Fragment key={item.id}>
              {item.section && <div className="sidebar-section-label">{item.section}</div>}
              <div className={`nav-item${panel===item.id?' active':''}`} onClick={()=>{ setPanel(item.id); if(item.id==='myorders') loadOrders(); }}>
                <span className="nav-icon">{item.icon}</span> {item.label}
                {item.badge && pendingCount > 0 && (
                  <span style={{ marginLeft:'auto', background:'var(--danger)', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:999 }}>{pendingCount}</span>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding:32, background:'var(--bg)' }}>

          {panel === 'overview' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>Welcome, {(user?.name||'Suresh').split(' ')[0]} 🙏</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>
                {[
                  { label:'My Orders',       value: orders.length,                                    c:'up'  },
                  { label:'Pending',         value: pendingCount,                                     c:'warn'},
                  { label:'Completed',       value: orders.filter(o=>o.status==='completed').length,   c:'up'  },
                  { label:'Active Listings', value: crops.filter(c=>c.status==='active').length || 6, c:''    },
                ].map((s,i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="ai-insight" style={{ marginBottom:20 }}>
                <div className="ai-insight-head"><span className="ai-badge">DEMAND ALERT</span></div>
                <div className="ai-text">🔥 <strong>Mustard demand surge detected</strong> — 12 buyers searching in Mathura. 8 farmers have listed stock. <strong>Act now before prices rise.</strong></div>
                <div className="ai-action" onClick={()=>setPanel('browse')}>Browse Mustard Listings →</div>
              </div>
              <div className="card">
                <div className="card-head"><span className="card-title">Recent Orders</span><button className="btn-secondary btn-sm" onClick={()=>setPanel('myorders')}>View All</button></div>
                <div className="card-body">
                  {orders.slice(0,3).length === 0
                    ? <div style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'20px 0' }}>No orders yet — browse the market to place your first order.</div>
                    : orders.slice(0,3).map(o => (
                      <div key={o._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--bg)' }}>
                        <div><div style={{ fontWeight:600 }}>{o.cropName}</div><div style={{ fontSize:12, color:'var(--muted)' }}>{o.farmerUid} · {o.quantity} Qtl</div></div>
                        <div style={{ textAlign:'right' }}><div style={{ fontWeight:700, color:'var(--green)' }}>₹{(o.totalAmount||0).toLocaleString()}</div><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999, background:'var(--green-pale)', color:'var(--green)' }}>{o.status}</span></div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {panel === 'browse' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:20 }}>Browse Market Listings</div>
              <div style={{ display:'flex', gap:12, marginBottom:24 }}>
                <input className="form-input" style={{ flex:1 }} placeholder="Search crop name..." value={search} onChange={e=>setSearch(e.target.value)} />
                <select className="form-select" style={{ width:170 }} value={district} onChange={e=>setDistrict(e.target.value)}>
                  <option value="">All Districts</option>
                  {['Ayodhya','Mathura','Agra','Delhi'].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {displayed.map((c,i) => (
                  <div key={c._id||c.id||i} className="market-card">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <div style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:700 }}>{c.name}</div>
                      {c.trend && <span style={{ fontSize:11, fontWeight:700, color:c.up?'#2E7D32':'var(--danger)' }}>{c.trend}</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>🌾 {c.farmerUid||c.farmer} · {c.district}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <div style={{ fontSize:13, color:'var(--muted)' }}>{c.quantity||c.qty} Qtl available</div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800, color:'var(--green)' }}>₹{(c.askedPrice||c.price||0).toLocaleString()}</div>
                        <div style={{ fontSize:11, color:'var(--muted)' }}>per qtl</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <input type="number" min="1" max={c.quantity||c.qty||999} placeholder="Qty (Qtl)"
                        value={qty[c._id||c.id]||''}
                        onChange={e => setQty(prev=>({ ...prev, [c._id||c.id]: e.target.value }))}
                        style={{ flex:1, padding:'8px 10px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'var(--font-body)', outline:'none' }}
                      />
                      <button className="btn-primary" style={{ flex:2, padding:9, fontSize:13, opacity: busy===(c._id||c.id)?0.7:1 }}
                        onClick={()=>placeOrder(c)} disabled={busy===(c._id||c.id)}>
                        {busy===(c._id||c.id) ? 'Placing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {panel === 'myorders' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:8 }}>My Orders</div>
              <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Track all orders you've placed with farmers.</p>
              {orders.length === 0
                ? <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
                    <div style={{ fontSize:40, marginBottom:16 }}>📦</div>
                    <div style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:700, marginBottom:8 }}>No orders yet</div>
                    <div style={{ fontSize:14 }}>Browse the market and place your first order.</div>
                    <button className="btn-primary" style={{ marginTop:20 }} onClick={()=>setPanel('browse')}>Browse Market →</button>
                  </div>
                : orders.map(order => (
                  <OrderCard key={order._id} order={order} role="wholesaler"
                    onCancel={handleCancel}
                  />
                ))
              }
            </div>
          )}

          {panel === 'demand' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:20 }}>Demand Alerts</div>
              {[
                { badge:'HOT 🔥', bg:'linear-gradient(135deg,#1B5E20,#2D6A2F)', text:'<strong>Mustard</strong> — 12 buyers searching in Mathura. 8 farmer listings available. Average ask: ₹5,200/qtl.' },
                { badge:'WATCH',  bg:'linear-gradient(135deg,#1565C0,#0D47A1)', text:'<strong>Sugarcane</strong> — Supply predicted to drop 20% in Agra next week. Stock up now.', badgeBg:'#BBDEFB', badgeColor:'#0D47A1' },
                { badge:'TRENDING', bg:'linear-gradient(135deg,#4A148C,#6A1B9A)', text:'<strong>Cotton</strong> — Delhi buyers aggressively purchasing. 35 Qtl available. ₹7,200/qtl.', badgeBg:'#E1BEE7', badgeColor:'#4A148C' },
              ].map((a,i) => (
                <div key={i} className="ai-insight" style={{ background:a.bg }}>
                  <div className="ai-insight-head"><span className="ai-badge" style={a.badgeBg?{background:a.badgeBg,color:a.badgeColor}:{}}>{a.badge}</span></div>
                  <div className="ai-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="ai-action" onClick={()=>setPanel('browse')}>Browse Now →</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
