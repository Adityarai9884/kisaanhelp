// pages/farmer/FarmerDashboard.jsx — Phase 3
import React, { useState, useEffect } from 'react';
import TransportCalc    from '../../components/TransportCalc';
import OrderCard        from '../../components/OrderCard';
import PaymentModal     from '../../components/PaymentModal';
import NotificationBell from '../../components/NotificationBell';
import { cropsAPI, transportAPI, ordersAPI, aiAPI } from '../../services/api';
import { PRICE_PREDICTIONS, WHEAT_PRICES_30D } from '../../data/mockData';

const NAV = [
  { id:'overview',  icon:'📊', label:'Overview'        },
  { id:'addcrop',   icon:'➕', label:'Add Crop'         },
  { id:'mycrops',   icon:'🌾', label:'My Crops'         },
  { id:'orders',    icon:'📦', label:'Orders',  badge: true },
  { id:'transport', icon:'🚛', label:'Transport'        },
  { id:'prices',    icon:'📈', label:'Price Forecast',  section:'AI Tools' },
  { id:'weather',   icon:'🌤️', label:'Weather Alert'   },
];

const FALLBACK_CROPS = [
  { name:'Wheat',   harvested:'Apr 2, 2026',  qty:45, listed:2900, ai:'₹2,840–3,100', status:'active'  },
  { name:'Mustard', harvested:'Mar 28, 2026', qty:20, listed:5200, ai:'₹5,000–5,500', status:'pending' },
  { name:'Rice',    harvested:'Mar 20, 2026', qty:60, listed:3100, ai:'₹3,000–3,200', status:'sold'    },
];

function PriceChart() {
  const prices = WHEAT_PRICES_30D;
  const max = Math.max(...prices), min = Math.min(...prices);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:7, height:82, marginTop:14 }}>
      {prices.map((p, i) => {
        const h = Math.round(((p - min) / (max - min)) * 70 + 10);
        return (
          <div key={i} title={`₹${p}`} style={{
            flex:1, height:h, borderRadius:'3px 3px 0 0',
            background: i >= 28 ? 'var(--green)' : 'var(--green-pale)',
            minHeight:8, cursor:'default',
          }} />
        );
      })}
    </div>
  );
}

export default function FarmerDashboard({ user, onToast, onLogout }) {
  const [panel,       setPanel]       = useState('overview');
  const [cropName,    setCropName]    = useState('Wheat');
  const [cropQty,     setCropQty]     = useState('');
  const [mycrops,     setMycrops]     = useState(FALLBACK_CROPS);
  const [orders,      setOrders]      = useState([]);
  const [pendingCount,setPendingCount]= useState(0);
  const [loading,     setLoading]     = useState(false);
  const [paymentOrder,setPaymentOrder]= useState(null);
  const [livePred,    setLivePred]    = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);

  const pred = PRICE_PREDICTIONS[cropName] || PRICE_PREDICTIONS.Wheat;

  useEffect(() => {
    cropsAPI.mine()
      .then(data => { if (data && data.length) setMycrops(data); })
      .catch(() => {});
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await ordersAPI.mine();
      setOrders(data || []);
      setPendingCount((data || []).filter(o => o.status === 'pending').length);
    } catch (_) {}
  }

  async function loadAIData(panelName) {
    if (panelName === 'prices' && !livePred) {
      setAiLoading(true);
      try {
        const data = await aiAPI.pricePrediction(cropName, user?.district || 'Ayodhya');
        setLivePred(data.prediction);
      } catch (_) {} finally { setAiLoading(false); }
    }
    if (panelName === 'weather' && !liveWeather) {
      setAiLoading(true);
      try {
        const data = await aiAPI.weather(user?.district || 'Ayodhya', cropName);
        setLiveWeather(data);
      } catch (_) {} finally { setAiLoading(false); }
    }
  }

  async function submitCrop() {
    if (!cropQty) { onToast('⚠️', 'Please enter quantity'); return; }
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await cropsAPI.create({
        name: cropName, quantity: Number(cropQty),
        harvestDate: today, askedPrice: 2800, grade: 'A',
      });
      onToast('🌾', 'Crop listed! Buyers can now see it.');
      const fresh = await cropsAPI.mine().catch(() => null);
      if (fresh && fresh.length) setMycrops(fresh);
    } catch (err) {
      onToast('⚠️', err.message || 'Using demo mode');
    } finally { setLoading(false); setPanel('mycrops'); }
  }

  async function handleConfirm(orderId) {
    try {
      await ordersAPI.confirm(orderId);
      onToast('✅', 'Order confirmed! Buyer has been notified.');
      loadOrders();
    } catch (err) { onToast('❌', err.message); }
  }

  async function handleReject(orderId) {
    try {
      await ordersAPI.reject(orderId, 'Not available');
      onToast('❌', 'Order rejected. Crop re-listed.');
      loadOrders();
    } catch (err) { onToast('❌', err.message); }
  }

  async function handlePayment(orderId, body) {
    try {
      await ordersAPI.payment(orderId, body);
      onToast('💰', 'Payment recorded!');
      loadOrders();
    } catch (err) { onToast('❌', err.message); }
  }

  const statusStyle = {
    active:  { background:'var(--green-pale)', color:'var(--green)'  },
    pending: { background:'var(--gold-light)',  color:'#6D4C00'      },
    sold:    { background:'#E8EAF6',            color:'#3949AB'      },
  };

  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      {/* Sub-header */}
      <div style={{
        background:'white', borderBottom:'1px solid var(--border)',
        padding:'0 32px', height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800 }}>🌾 Farmer Dashboard</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <NotificationBell />
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>{user?.name || 'Ramesh Kumar'}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{user?.uid || 'FRAY0001'} · {user?.district || 'Ayodhya'}</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>
            {(user?.name || 'RK').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <button className="btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 128px)' }}>
        {/* Sidebar */}
        <div className="dash-sidebar">
          {NAV.map((item) => (
            <React.Fragment key={item.id}>
              {item.section && <div className="sidebar-section-label">{item.section}</div>}
              <div className={`nav-item${panel === item.id ? ' active' : ''}`} onClick={() => { setPanel(item.id); if (item.id === 'orders') loadOrders(); if (item.id === 'prices' || item.id === 'weather') loadAIData(item.id); }}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && pendingCount > 0 && (
                  <span style={{ marginLeft:'auto', background:'var(--danger)', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:999 }}>
                    {pendingCount}
                  </span>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding:32, background:'var(--bg)', overflowY:'auto' }}>

          {/* ── OVERVIEW ── */}
          {panel === 'overview' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>
                Good Morning, {(user?.name || 'Ramesh').split(' ')[0]} 🙏
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Active Listings',   value: mycrops.filter(c=>c.status==='active').length || 4,  change:'Your crops live on market', c:'up'   },
                  { label:'Pending Orders',     value: pendingCount,                                        change: pendingCount > 0 ? '⚡ Action required!' : 'No pending orders', c:'warn' },
                  { label:'Completed Sales',    value: orders.filter(o=>o.status==='completed').length || 0,change:'Total completed',           c:'up'   },
                  { label:'AI Alerts',          value:'2',                                                  change:'⚡ Action recommended',     c:'warn' },
                ].map((s,i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className={`stat-change change-${s.c}`}>{s.change}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">My Crop Listings</span>
                    <button className="btn-primary btn-sm" onClick={() => setPanel('addcrop')}>+ Add Crop</button>
                  </div>
                  <div className="card-body">
                    <table className="data-table">
                      <thead><tr><th>Crop</th><th>Qty (Qtl)</th><th>Base Price</th><th>Status</th></tr></thead>
                      <tbody>
                        {mycrops.map((c,i) => (
                          <tr key={c._id || i}>
                            <td><div style={{ fontWeight:600 }}>{c.name}</div><div style={{ fontSize:12, color:'var(--muted)' }}>{c.harvested || (c.harvestDate && new Date(c.harvestDate).toLocaleDateString('en-IN'))}</div></td>
                            <td>{c.qty || c.quantity}</td>
                            <td>₹{(c.listed || c.askedPrice || 0).toLocaleString()}</td>
                            <td><span className="pill" style={statusStyle[c.status] || statusStyle.active}>{c.status ? c.status.charAt(0).toUpperCase()+c.status.slice(1) : 'Active'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div className="ai-insight">
                    <div className="ai-insight-head"><span className="ai-badge">GEMINI AI</span></div>
                    <div className="ai-text">🌾 <strong>Wheat prices</strong> likely to rise 10% next week. <strong>Hold Stock recommended.</strong></div>
                    <div className="ai-action" onClick={() => setPanel('prices')}>View Full Forecast →</div>
                  </div>
                  <div className="ai-insight" style={{ background:'linear-gradient(135deg,#0277BD,#01579B)' }}>
                    <div className="ai-insight-head"><span className="ai-badge" style={{ background:'#90CAF9', color:'#01579B' }}>WEATHER</span></div>
                    <div className="ai-text">🌧️ Heavy rain in <strong>your district on Friday</strong>. Move crops to Mandi by Thursday.</div>
                    <div className="ai-action" onClick={() => setPanel('weather')}>Full Weather Report →</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADD CROP ── */}
          {panel === 'addcrop' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>Add New Crop Listing</div>
              <div className="card">
                <div className="card-head"><span className="card-title">Crop Details</span></div>
                <div className="card-body">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                    <div className="form-group">
                      <label className="form-label">Crop Name</label>
                      <select className="form-select" value={cropName} onChange={e => setCropName(e.target.value)}>
                        {Object.keys(PRICE_PREDICTIONS).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity (Quintals)</label>
                      <input className="form-input" type="number" placeholder="e.g. 10" value={cropQty} onChange={e => setCropQty(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Harvest Date</label>
                      <input className="form-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Grade / Quality</label>
                      <select className="form-select">
                        <option>Grade A (Premium)</option><option>Grade B (Standard)</option><option>Grade C (Economy)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn:'1/-1' }}>
                      <label className="form-label">AI Price Prediction</label>
                      <div style={{ background:'var(--green-pale)', border:'1px solid var(--green)', borderRadius:12, padding:18 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>🤖 Gemini Suggested Base Price</span>
                          <span className="ai-badge" style={{ background:'var(--green)', color:'white' }}>LIVE AI</span>
                        </div>
                        <div style={{ fontFamily:'var(--font-head)', fontSize:24, fontWeight:800, color:'var(--green)' }}>{pred.range} / qtl</div>
                        <div style={{ fontSize:12, color:'#388E3C', marginTop:4 }}>{pred.note}</div>
                        <div style={{ marginTop:8, display:'inline-block', padding:'4px 12px', background:'var(--green)', color:'white', borderRadius:6, fontSize:12, fontWeight:700 }}>
                          Action: {pred.action}
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Asking Price (₹/qtl)</label>
                      <input className="form-input" type="number" placeholder="Enter your price" />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:14, marginTop:28 }}>
                    <button className="btn-primary" style={{ flex:1, padding:14, opacity:loading?0.7:1 }} onClick={submitCrop} disabled={loading}>
                      {loading ? 'Listing...' : '🌾 List Crop Now'}
                    </button>
                    <button className="btn-secondary" onClick={() => setPanel('mycrops')}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MY CROPS ── */}
          {panel === 'mycrops' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>My Crop Listings</div>
              <div className="card">
                <div className="card-body">
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Qty (Qtl)</th><th>Listed Price</th><th>AI Suggests</th><th>Harvest Date</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {mycrops.map((c,i) => (
                        <tr key={c._id || i}>
                          <td><div style={{ fontWeight:600 }}>{c.name}</div></td>
                          <td>{c.qty || c.quantity}</td>
                          <td>₹{(c.listed || c.askedPrice || 0).toLocaleString()}</td>
                          <td style={{ fontSize:13, color:'var(--muted)' }}>{c.ai || (PRICE_PREDICTIONS[c.name] ? PRICE_PREDICTIONS[c.name].range : '—')}</td>
                          <td style={{ fontSize:13 }}>{c.harvested || (c.harvestDate && new Date(c.harvestDate).toLocaleDateString('en-IN'))}</td>
                          <td><span className="pill" style={statusStyle[c.status] || statusStyle.active}>{c.status ? c.status.charAt(0).toUpperCase()+c.status.slice(1) : 'Active'}</span></td>
                          <td><button style={{ background:'none', border:'1px solid var(--border)', padding:'6px 10px', borderRadius:6, cursor:'pointer', fontSize:12 }} onClick={() => onToast('✅','Updated!')}>Edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {panel === 'orders' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:8 }}>Incoming Orders</div>
              <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Review and confirm orders from buyers. Once confirmed, payment tracking begins.</p>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                {[
                  { label:'Total Orders',   value: orders.length,                                           color:'var(--text)'   },
                  { label:'Pending',        value: orders.filter(o=>o.status==='pending').length,            color:'#BA7517'       },
                  { label:'Confirmed',      value: orders.filter(o=>o.status==='confirmed').length,          color:'var(--green)'  },
                  { label:'Completed',      value: orders.filter(o=>o.status==='completed').length,          color:'#3949AB'       },
                ].map((s,i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color:s.color, fontSize:24 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
                  <div style={{ fontSize:40, marginBottom:16 }}>📦</div>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:700, marginBottom:8 }}>No orders yet</div>
                  <div style={{ fontSize:14 }}>Once buyers place orders on your crops, they'll appear here.</div>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order._id} order={order} role="farmer"
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    onPayment={(o) => setPaymentOrder(o)}
                  />
                ))
              )}
            </div>
          )}

          {/* ── TRANSPORT ── */}
          {panel === 'transport' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>Book Transport</div>
              <div className="card">
                <div className="card-head"><span className="card-title">Smart Transport Calculator</span></div>
                <div className="card-body">
                  <TransportCalc onBook={async (v, kg) => {
                    try {
                      await transportAPI.book({ weightKg: kg, toMandi: user?.district || 'Ayodhya Mandi' });
                      onToast('🚛', `${v.name} booked for ${kg.toLocaleString()}kg!`);
                    } catch (_) { onToast('🚛', `${v.name} booking saved (demo mode)`); }
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* ── PRICES ── */}
          {panel === 'prices' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>AI Price Forecast</div>
              <div className="card">
                <div className="card-head">
                  <span className="card-title">30-Day Trend · {cropName} · {user?.district || 'Ayodhya'}</span>
                  <span className="ai-badge" style={{ background:'var(--green)', color:'white', padding:'4px 10px', borderRadius:6 }}>GEMINI POWERED</span>
                </div>
                <div className="card-body">
                  {aiLoading ? (
                    <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>🤖 Gemini is analyzing market data...</div>
                  ) : (
                    <>
                      <div style={{ display:'flex', gap:32, marginBottom:20 }}>
                        <div>
                          <div style={{ fontSize:13, color:'var(--muted)' }}>Predicted Price</div>
                          <div style={{ fontFamily:'var(--font-head)', fontSize:28, fontWeight:800, color:'var(--green)' }}>
                            {livePred ? `₹${livePred.predictedPrice?.toLocaleString()}` : '₹2,840'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:13, color:'var(--muted)' }}>7-Day Range</div>
                          <div style={{ fontFamily:'var(--font-head)', fontSize:28, fontWeight:800, color:'#2E7D32' }}>
                            {livePred ? `₹${livePred.minPrice?.toLocaleString()}–${livePred.maxPrice?.toLocaleString()}` : '₹2,800–3,100'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:13, color:'var(--muted)' }}>Recommendation</div>
                          <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800, color:'var(--gold)' }}>
                            {livePred ? livePred.recommendation : '⏸ Hold Stock'}
                          </div>
                        </div>
                      </div>
                      <PriceChart />
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                        <span style={{ fontSize:11, color:'var(--muted)' }}>30 days ago</span>
                        <span style={{ fontSize:11, color:'var(--muted)' }}>Today</span>
                      </div>
                      <div className="ai-insight" style={{ marginTop:20 }}>
                        <div className="ai-insight-head"><span className="ai-badge">GEMINI AI</span></div>
                        <div className="ai-text">
                          {livePred ? livePred.reasoning : 'Wheat prices likely to increase next week. Hold stock for 5–7 days for better returns.'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── WEATHER ── */}
          {panel === 'weather' && (
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, marginBottom:24 }}>Weather Advisory · {user?.district || 'Ayodhya'}</div>
              {aiLoading ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>🌤️ Fetching live weather data...</div>
              ) : liveWeather ? (
                <>
                  {/* Live current weather */}
                  <div style={{ background:'linear-gradient(135deg,#0277BD,#01579B)', borderRadius:14, padding:24, color:'white', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, opacity:.7, marginBottom:4 }}>Current · {user?.district || 'Ayodhya'}</div>
                      <div style={{ fontFamily:'var(--font-head)', fontSize:44, fontWeight:800 }}>
                        {liveWeather.weatherData?.current?.icon} {liveWeather.weatherData?.current?.temp}°C
                      </div>
                      <div style={{ fontSize:14, opacity:.8, textTransform:'capitalize' }}>{liveWeather.weatherData?.current?.description}</div>
                    </div>
                    <div style={{ textAlign:'right', opacity:.8, fontSize:13 }}>
                      <div>Humidity {liveWeather.weatherData?.current?.humidity}%</div>
                      <div>Wind {liveWeather.weatherData?.current?.windSpeed} km/h</div>
                      {liveWeather.weatherData?.source === 'demo' && <div style={{ marginTop:8, fontSize:11, opacity:.6 }}>Demo data</div>}
                    </div>
                  </div>
                  {/* Forecast */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
                    {(liveWeather.weatherData?.forecast || []).map((f, i) => (
                      <div key={i} className="stat-card" style={{ textAlign:'center', background: f.rain ? 'var(--gold-light)' : 'var(--card)', border: f.rain ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
                        <div className="stat-label">{f.date}</div>
                        <div style={{ fontSize:28, margin:'6px 0' }}>{f.icon}</div>
                        <div style={{ fontFamily:'var(--font-head)', fontWeight:700 }}>{f.temp}°C</div>
                        {f.rain && <div style={{ fontSize:11, color:'#BA7517', fontWeight:600, marginTop:4 }}>🌧 {f.rainChance}%</div>}
                      </div>
                    ))}
                  </div>
                  {/* AI advice */}
                  {liveWeather.advice && (
                    <div className="ai-insight" style={{
                      background: liveWeather.advice.urgency === 'immediate' ? 'linear-gradient(135deg,#C62828,#E53935)'
                                : liveWeather.advice.urgency === 'soon' ? 'linear-gradient(135deg,#E65100,#BF360C)'
                                : 'linear-gradient(135deg,#1B5E20,#2D6A2F)'
                    }}>
                      <div className="ai-insight-head">
                        <span className="ai-badge" style={{ background:'rgba(255,255,255,0.2)', color:'white' }}>
                          🤖 AI ADVISORY
                        </span>
                        <span style={{ fontSize:13, opacity:.8, fontWeight:700 }}>{liveWeather.advice.action}</span>
                      </div>
                      <div className="ai-text">{liveWeather.advice.advice}</div>
                    </div>
                  )}
                </>
              ) : (
                /* Fallback static */
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
                    {[
                      { day:'Today',    icon:'☀️', temp:'32°C', note:'Clear · Low humidity',    bg:'linear-gradient(135deg,#0277BD,#01579B)', white:true },
                      { day:'Tomorrow', icon:'⛅', temp:'29°C', note:'Partly cloudy',           bg:'var(--card)' },
                      { day:'Thursday', icon:'🌧️', temp:'24°C', note:'⚡ Heavy rain incoming!', bg:'var(--gold-light)', border:'1px solid var(--gold)' },
                      { day:'Friday',   icon:'⛈️', temp:'22°C', note:'Severe rain',             bg:'var(--card)' },
                    ].map((w,i) => (
                      <div key={i} className="stat-card" style={{ background:w.bg, border:w.border||'1px solid var(--border)' }}>
                        <div className="stat-label" style={{ color:w.white?'rgba(255,255,255,0.7)':'var(--muted)' }}>{w.day}</div>
                        <div className="stat-value" style={{ color:w.white?'white':'var(--text)' }}>{w.icon} {w.temp}</div>
                        <div className="stat-change" style={{ color:w.white?'rgba(255,255,255,0.7)':i===2?'#8D6E00':i===3?'var(--danger)':'var(--muted)' }}>{w.note}</div>
                      </div>
                    ))}
                  </div>
                  <div className="ai-insight" style={{ background:'linear-gradient(135deg,#E65100,#BF360C)' }}>
                    <div className="ai-insight-head"><span className="ai-badge" style={{ background:'#FFCCBC', color:'#BF360C' }}>⚡ URGENT</span></div>
                    <div className="ai-text"><strong>Heavy rain predicted Friday.</strong> Complete harvesting and move crops to Mandi by Thursday evening.</div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Payment Modal */}
      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
}
