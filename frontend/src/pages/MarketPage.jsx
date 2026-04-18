// pages/MarketPage.jsx
import React, { useState, useEffect } from 'react';
import { cropsAPI } from '../services/api';
import { CROPS } from '../data/mockData';
import PriceTicker from '../components/PriceTicker';

export default function MarketPage({ onToast }) {
  const [crops,    setCrops]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [district, setDistrict] = useState('');

  useEffect(() => {
    cropsAPI.list({ district, name: search })
      .then(data => setCrops(data.crops || data))
      .catch(() => setCrops(CROPS))
      .finally(() => setLoading(false));
  }, [search, district]);

  const displayed = crops.length > 0 ? crops : CROPS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (!district || c.district === district)
  );

  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      <PriceTicker />
      <div style={{ padding:'48px 60px' }}>
        <div className="section-tag">Live Marketplace</div>
        <h2 className="section-title" style={{ marginBottom:8 }}>Browse All Crop Listings</h2>
        <p style={{ color:'var(--muted)', marginBottom:28 }}>Direct from farmers across Ayodhya, Mathura, Agra & Delhi</p>
        <div style={{ display:'flex', gap:12, marginBottom:28 }}>
          <input className="form-input" style={{ flex:1, maxWidth:400 }}
            placeholder="Search by crop name..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width:180 }}
            value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="">All Districts</option>
            {['Ayodhya','Mathura','Agra','Delhi'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        {loading ? (
          <div style={{ color:'var(--muted)', fontSize:14 }}>Loading crops...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {displayed.map((c, i) => (
              <div key={c._id || c.id || i} className="market-card">
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:700 }}>{c.name}</div>
                  {c.trend && <span style={{ fontSize:11, fontWeight:700, color:c.up?'#2E7D32':'var(--danger)' }}>{c.trend}</span>}
                </div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:12 }}>
                  🌾 {c.farmerUid || c.farmer} · {c.district}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <span style={{ fontSize:14, color:'var(--muted)' }}>{c.quantity ? `${c.quantity} Qtl` : c.qty} available</span>
                  <div>
                    <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800, color:'var(--green)' }}>
                      ₹{(c.askedPrice || c.price || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>per qtl</div>
                  </div>
                </div>
                <button className="btn-primary" style={{ width:'100%', marginTop:14, padding:10, fontSize:13 }}
                  onClick={() => onToast('🛒', `Request sent to ${c.farmerUid || c.farmer}!`)}>
                  Request to Buy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
