// pages/TransportPage.jsx
import React from 'react';
import TransportCalc from '../components/TransportCalc';

export default function TransportPage({ onToast, onRegister }) {
  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      <div style={{ padding:'48px 60px' }}>
        <div className="section-tag">Smart Transport</div>
        <h2 className="section-title">Auto Vehicle Recommendation</h2>
        <p style={{ color:'var(--muted)', marginBottom:48, lineHeight:1.7 }}>
          Enter your crop weight and the system instantly recommends the right vehicle.
          No calls, no negotiations — fully automated.
        </p>

        <div style={{
          background:'var(--card)', borderRadius:20, padding:48,
          boxShadow:'var(--shadow)', border:'1px solid rgba(249,168,37,0.2)',
          maxWidth:700,
        }}>
          <TransportCalc onBook={(v, kg) => {
            onToast('🚛', `${v.name} booked for ${kg.toLocaleString()}kg!`);
          }} />
        </div>

        {/* Info cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginTop:40, maxWidth:700 }}>
          {[
            { icon:'🛺', title:'E-Rickshaw / 3-Wheeler', range:'Up to 500 kg', note:'Best for small farms & local delivery within district.' },
            { icon:'🚐', title:'Tata Ace (Chota Hathi)',  range:'500–2,000 kg', note:'Most popular choice. Covers all 4 districts comfortably.' },
            { icon:'🚛', title:'Heavy Duty Truck',         range:'2,000 kg+',  note:'Bulk transport for large wholesaler orders.' },
          ].map((v,i) => (
            <div key={i} className="card" style={{ padding:22, textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>{v.icon}</div>
              <div style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, marginBottom:4 }}>{v.title}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--green)', marginBottom:8 }}>{v.range}</div>
              <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.55 }}>{v.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
