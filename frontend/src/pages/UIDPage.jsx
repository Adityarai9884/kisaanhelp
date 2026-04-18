// pages/UIDPage.jsx
import React from 'react';
import UIDGenerator from '../components/UIDGenerator';

export default function UIDPage() {
  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      <div style={{ padding:'48px 60px' }}>
        <div className="section-tag">Smart Identity System</div>
        <h2 className="section-title">AgriSmart UID Generator</h2>
        <p style={{ color:'var(--muted)', marginBottom:48, lineHeight:1.7, maxWidth:560 }}>
          Every user gets a unique professional ID based on their role and district.
          The Mandi Incharge can instantly identify who is at the gate — no confusion, no fraud.
        </p>
        <UIDGenerator />

        {/* How it works */}
        <div style={{ marginTop:60 }}>
          <h3 style={{ fontFamily:'var(--font-head)', fontSize:24, fontWeight:800, marginBottom:24 }}>How the ID System Works</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { step:'01', title:'Role Code (2 chars)', desc:'FR = Farmer, WH = Wholesaler, BY = Buyer, IN = Incharge, AD = Admin', color:'var(--green-pale)', border:'var(--green)' },
              { step:'02', title:'District Code (2 chars)', desc:'AY = Ayodhya, MT = Mathura, AG = Agra, DL = Delhi — more districts in Phase 3', color:'var(--gold-light)', border:'var(--gold)' },
              { step:'03', title:'Serial Number (4 digits)', desc:'Auto-incremented per district+role combo. FRAY0001 = first farmer in Ayodhya', color:'#E3F2FD', border:'var(--sky)' },
            ].map((s,i) => (
              <div key={i} style={{ background:s.color, border:`1.5px solid ${s.border}`, borderRadius:14, padding:24 }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:32, fontWeight:800, opacity:.3, marginBottom:10 }}>{s.step}</div>
                <div style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</div>
                <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend note */}
        <div style={{ marginTop:40, background:'#1A2B1A', color:'rgba(255,255,255,0.8)', borderRadius:14, padding:24 }}>
          <div style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, color:'white', marginBottom:8 }}>
            📋 Backend Note (Phase 2)
          </div>
          <div style={{ fontSize:14, lineHeight:1.7 }}>
            Before saving a new user, the backend will query MongoDB for the total count of existing users
            with the same <code style={{ background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:4 }}>role + district</code> combination,
            then auto-increment the serial number. This ensures uniqueness without manual input.
          </div>
          <div style={{ marginTop:12, fontFamily:'monospace', fontSize:13, color:'#A5D6A7', background:'rgba(0,0,0,0.3)', padding:'12px 16px', borderRadius:8 }}>
            {`const count = await User.countDocuments({ role, district });`}<br/>
            {`const serial = String(count + 1).padStart(4, '0');`}<br/>
            {`const uid = roleCode + distCode + serial; // e.g. "FRAY0001"`}
          </div>
        </div>
      </div>
    </div>
  );
}
