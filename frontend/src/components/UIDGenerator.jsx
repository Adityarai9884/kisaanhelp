// components/UIDGenerator.jsx
import React, { useState } from 'react';
import { ROLE_NAMES, DIST_NAMES } from '../data/mockData';

const ROLES = [
  { value:'FR', label:'👨‍🌾 Farmer (FR)'          },
  { value:'WH', label:'🏪 Wholesaler (WH)'         },
  { value:'BY', label:'🛒 Buyer (BY)'              },
  { value:'IN', label:'👮 Mandi Incharge (IN)'     },
  { value:'AD', label:'⚙️ Admin (AD)'              },
];
const DISTS = [
  { value:'AY', label:'Ayodhya (AY)' },
  { value:'MT', label:'Mathura (MT)' },
  { value:'AG', label:'Agra (AG)'    },
  { value:'DL', label:'Delhi (DL)'   },
];

function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default function UIDGenerator() {
  const [role,   setRole]   = useState('FR');
  const [dist,   setDist]   = useState('AY');
  const [serial, setSerial] = useState(1);

  const pad    = String(Math.max(1, serial)).padStart(4, '0');
  const uid    = role + dist + pad;
  const n      = parseInt(pad);
  const desc   = `${n}${ordinal(n)} ${ROLE_NAMES[role]} registered in ${DIST_NAMES[dist]}`;

  const examples = [
    { id:'FRAY0001', desc:'1st Farmer — Ayodhya'         },
    { id:'WHMT0512', desc:'512th Wholesaler — Mathura'   },
    { id:'INDL0005', desc:'5th Incharge — Delhi'         },
    { id:'BYAG0099', desc:'99th Buyer — Agra'            },
  ];

  return (
    <div style={{
      background:'var(--card)', borderRadius:20, padding:48,
      border:'1px solid var(--border)', boxShadow:'var(--shadow)',
      display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center',
    }}>
      {/* Builder */}
      <div>
        <div className="form-group" style={{ marginBottom:18 }}>
          <label className="form-label">Select Role</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom:18 }}>
          <label className="form-label">Select District</label>
          <select className="form-select" value={dist} onChange={e => setDist(e.target.value)}>
            {DISTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom:24 }}>
          <label className="form-label">Serial Number</label>
          <input className="form-input" type="number" min={1} max={9999} value={serial}
                 onChange={e => setSerial(Number(e.target.value))} />
        </div>
        {/* Result */}
        <div style={{
          background:'var(--green)', color:'white', padding:'22px 24px',
          borderRadius:14, textAlign:'center',
        }}>
          <div style={{ fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
            Generated AgriSmart ID
          </div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:38, fontWeight:800, letterSpacing:3 }}>
            {uid}
          </div>
          <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>{desc}</div>
        </div>
      </div>

      {/* Breakdown + Examples */}
      <div>
        {/* Part breakdown */}
        <div style={{ display:'flex', gap:4, justifyContent:'center', marginBottom:32 }}>
          {[
            { code: role, name:'Role',    bg:'#E8F5E9', border:'#4CAF50', color:'#2D6A2F', sub:'#388E3C' },
            null,
            { code: dist, name:'District',bg:'#FFF8E1', border:'#F9A825', color:'#6D4C00', sub:'#8D6E00' },
            null,
            { code: pad,  name:'Serial',  bg:'#E3F2FD', border:'#0277BD', color:'#01579B', sub:'#0277BD' },
          ].map((p, i) => p === null ? (
            <span key={i} style={{ fontFamily:'var(--font-head)', fontSize:26, fontWeight:800, color:'var(--border)', alignSelf:'center', padding:'0 4px' }}>+</span>
          ) : (
            <div key={i} style={{
              background:p.bg, border:`2px solid ${p.border}`,
              borderRadius:10, padding:'12px 16px', textAlign:'center',
            }}>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, color:p.color }}>{p.code}</div>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.5, color:p.sub, marginTop:3 }}>{p.name}</div>
            </div>
          ))}
        </div>

        {/* Examples */}
        <div style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Real Examples
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {examples.map(ex => (
            <div key={ex.id} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'11px 14px', background:'var(--bg)',
              borderRadius:10, border:'1px solid var(--border)',
            }}>
              <span style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, color:'var(--green)' }}>{ex.id}</span>
              <span style={{ fontSize:13, color:'var(--muted)' }}>{ex.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
