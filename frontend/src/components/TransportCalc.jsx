// components/TransportCalc.jsx
import React, { useState } from 'react';
import { TRANSPORT_VEHICLES, getVehicle } from '../data/mockData';

export default function TransportCalc({ onBook }) {
  const [kg, setKg] = useState(500);
  const recommended = getVehicle(kg);

  return (
    <div>
      {/* Slider value */}
      <div style={{ textAlign:'center', marginBottom:4 }}>
        <span style={{ fontFamily:'var(--font-head)', fontSize:44, fontWeight:800, color:'var(--green)' }}>
          {kg.toLocaleString()}
        </span>
        <span style={{ fontSize:14, color:'var(--muted)', marginLeft:8 }}>Kilograms</span>
      </div>

      {/* Slider */}
      <div style={{ margin:'20px 0 8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:12, color:'var(--muted)' }}>
          <span>100 kg</span><span>5,000 kg</span>
        </div>
        <input
          type="range" min={100} max={5000} value={kg}
          onChange={e => setKg(Number(e.target.value))}
          style={{
            WebkitAppearance:'none', width:'100%', height:8,
            borderRadius:4, background:'var(--border)', outline:'none', cursor:'pointer',
          }}
        />
      </div>

      {/* Vehicles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:28 }}>
        {TRANSPORT_VEHICLES.map(v => (
          <div key={v.id} className={`vehicle-card${recommended?.id === v.id ? ' selected' : ''}`}>
            <div className="vehicle-emoji">{v.emoji}</div>
            <div className="vehicle-name">{v.name}</div>
            <div className="vehicle-range">{v.range}</div>
            <div className="vehicle-rec-badge">✓ Recommended</div>
          </div>
        ))}
      </div>

      {onBook && (
        <button className="btn-primary" style={{ marginTop:28, width:'100%', padding:14 }} onClick={() => onBook(recommended, kg)}>
          Book {recommended?.name || 'Vehicle'} Now
        </button>
      )}
    </div>
  );
}
