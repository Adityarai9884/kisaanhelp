// pages/Landing.jsx
import React, { useEffect, useRef } from 'react';
import PriceTicker from '../components/PriceTicker';

const FEATURES = [
  { icon:'🌾', bg:'#E8F5E9', title:'List Your Crops',         text:'Add crop name, quantity in quintals, and harvest date in 30 seconds. AI instantly suggests your base price so you never undersell.' },
  { icon:'🤖', bg:'#FFF8E1', title:'Gemini Price Prediction',  text:'30 days of Mandi data fed to Google Gemini. Get "hold stock" or "sell now" recommendations backed by real data.' },
  { icon:'🚚', bg:'#E3F2FD', title:'Smart Transport',          text:'Enter your crop weight and the system auto-recommends E-Rickshaw, Tata Ace, or Heavy Truck — no calls, no negotiations.' },
  { icon:'🛡️', bg:'#F3E5F5', title:'Smart Identity (UID)',    text:'Every user gets a professional ID like FRAY0001 or WHMT0512. Mandi Incharge instantly knows who\'s at the gate.' },
  { icon:'☁️', bg:'#FCE4EC', title:'Weather Alerts',          text:'Live weather data for your district. Get "harvest by Thursday" warnings before rain hits your crops.' },
  { icon:'📊', bg:'#E8EAF6', title:'5 Role Dashboards',        text:'Separate dashboards for Farmers, Wholesalers, Buyers, Mandi Incharge, and Admin. Everyone sees exactly what they need.' },
];

const ROLES = [
  { icon:'👨‍🌾', name:'Farmer',        code:'FR — FRAY####', desc:'List crops, get AI prices, book transport' },
  { icon:'🏪', name:'Wholesaler',     code:'WH — WHMT####', desc:'Browse bulk listings, track orders' },
  { icon:'🛒', name:'Retail Buyer',   code:'BY — BYAG####', desc:'Small quantity retail purchases' },
  { icon:'👮', name:'Mandi Incharge', code:'IN — INDL####', desc:'Gate entry, stock management, rates' },
  { icon:'⚙️', name:'Admin',         code:'AD — ########', desc:'Full system oversight & analytics' },
];

function useCounter(target, duration = 1800) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString();
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
}

function StatCounter({ value, label }) {
  const ref = useCounter(value);
  return (
    <div>
      <div ref={ref} style={{ fontFamily:'var(--font-head)', fontSize:28, fontWeight:800, color:'var(--green)' }}>0</div>
      <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{label}</div>
    </div>
  );
}

export default function Landing({ onRegister, onNav }) {
  const [activeRole, setActiveRole] = React.useState(0);

  return (
    <div style={{ paddingTop:'var(--navbar-h)' }}>
      <PriceTicker />

      {/* ── HERO ── */}
      <section style={{
        display:'grid', gridTemplateColumns:'1fr 1fr',
        minHeight:'calc(100vh - var(--navbar-h) - 44px)',
      }}>
        <div style={{ padding:'80px 60px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--gold-light)', border:'1px solid var(--gold)',
            color:'#6D4C00', padding:'6px 16px', borderRadius:999,
            fontSize:13, fontWeight:600, width:'fit-content', marginBottom:26,
            animation:'fadeUp 0.5s ease both',
          }}>
            <span className="badge-dot"></span> Live · AI-Powered Digital Mandi
          </div>

          <h1 style={{
            fontFamily:'var(--font-head)', fontSize:'clamp(38px,5vw,60px)',
            fontWeight:800, lineHeight:1.05, marginBottom:18,
            animation:'fadeUp 0.5s ease 0.1s both',
          }}>
            Direct from <span style={{ color:'var(--green)' }}>Farm</span><br/>
            to Market —<br/>No Middlemen.
          </h1>

          <p style={{
            fontSize:17, color:'var(--muted)', lineHeight:1.7,
            maxWidth:460, marginBottom:38,
            animation:'fadeUp 0.5s ease 0.2s both',
          }}>
            AgriSmart connects farmers in Ayodhya, Mathura, Agra & Delhi directly with
            wholesalers and buyers. AI-powered price predictions so you're never cheated.
          </p>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', animation:'fadeUp 0.5s ease 0.3s both' }}>
            <button className="btn-primary" onClick={() => onRegister('farmer')}>🌾 Join as Farmer</button>
            <button className="btn-secondary" onClick={() => onRegister('buyer')}>🏪 Join as Buyer</button>
          </div>

          <div style={{ display:'flex', gap:36, marginTop:52, animation:'fadeUp 0.5s ease 0.4s both' }}>
            <StatCounter value={1248} label="Active Farmers" />
            <StatCounter value={3420} label="Crops Listed" />
            <StatCounter value={4}    label="Districts Covered" />
            <StatCounter value={89}   label="Transactions Today" />
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          background:'linear-gradient(145deg,#1B5E20,#2D6A2F,#388E3C)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'60px 40px', position:'relative', overflow:'hidden',
        }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16, zIndex:2, width:'100%', maxWidth:360, animation:'fadeUp 0.7s ease 0.3s both' }}>
            {[
              { label:'AI Price Alert', icon:'🤖', val:'₹2,840/qtl', sub:'Wheat · Ayodhya Mandi', tag:'↑ +10% next week', tagColor:'rgba(76,175,80,0.35)', tagText:'#A5D6A7' },
              { label:'Weather Advisory', icon:'🌧️', val:'Heavy Rain', sub:'Friday · Ayodhya District', tag:'⚡ Harvest by Thursday', tagColor:'rgba(198,40,40,0.3)', tagText:'#EF9A9A' },
              { label:'Demand Surge', icon:'📈', val:'Mustard', sub:'12 buyers searching in Mathura', tag:'🔥 List your stock now', tagColor:'rgba(249,168,37,0.3)', tagText:'#FFE082' },
              { label:'Transport', icon:'🚛', val:'Tata Ace', sub:'For 800 kg · FRAY0247', tag:'Auto-assigned', tagColor:'rgba(249,168,37,0.3)', tagText:'#FFE082' },
            ].map((card, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.11)',
                backdropFilter:'blur(10px)',
                border:'1px solid rgba(255,255,255,0.18)',
                borderRadius:14, padding:'17px 20px', color:'white',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:11, opacity:.7, fontWeight:500, textTransform:'uppercase', letterSpacing:.5 }}>{card.label}</span>
                  <span style={{ fontSize:20 }}>{card.icon}</span>
                </div>
                <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700 }}>{card.val}</div>
                <div style={{ fontSize:12, opacity:.6, marginTop:2 }}>{card.sub}</div>
                <div style={{
                  display:'inline-block', marginTop:8,
                  fontSize:11, fontWeight:600,
                  padding:'3px 10px', borderRadius:999,
                  background:card.tagColor, color:card.tagText,
                }}>{card.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding:'80px 60px' }}>
        <div className="section-tag">Platform Features</div>
        <h2 className="section-title">Everything a Farmer<br/>Actually Needs</h2>
        <p className="section-sub">Built ground-up for the real Indian agricultural ecosystem — district-specific, AI-powered, and corruption-free.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, marginTop:52 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background:'var(--card)', borderRadius:'var(--radius)',
              padding:'30px 26px', border:'1px solid var(--border)',
              transition:'all 0.3s', cursor:'default',
              position:'relative', overflow:'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{ width:50, height:50, borderRadius:12, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18 }}>{f.icon}</div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:700, marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section style={{ background:'#1A2B1A', padding:'80px 60px' }}>
        <div className="section-tag" style={{ color:'var(--gold)' }}>Who It's For</div>
        <h2 className="section-title" style={{ color:'white' }}>5 Roles. One Platform.</h2>
        <p className="section-sub" style={{ color:'rgba(255,255,255,0.5)' }}>Click any role to learn more.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginTop:48 }}>
          {ROLES.map((r, i) => (
            <div key={i}
              onClick={() => setActiveRole(i)}
              style={{
                background: activeRole === i ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${activeRole === i ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius:14, padding:'22px 18px', textAlign:'center',
                cursor:'pointer', color:'white', transition:'all 0.25s',
                transform: activeRole === i ? 'translateY(-4px)' : '',
                boxShadow: activeRole === i ? '0 12px 32px rgba(45,106,47,0.4)' : '',
              }}
            >
              <div style={{ fontSize:34, marginBottom:12 }}>{r.icon}</div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:15, fontWeight:700, marginBottom:5 }}>{r.name}</div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, opacity:.5, marginBottom:8 }}>{r.code}</div>
              <div style={{ fontSize:12, opacity:.6, lineHeight:1.45 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── UID CTA ── */}
      <section style={{ padding:'80px 60px', background:'var(--bg)' }}>
        <div className="section-tag">Smart Identity</div>
        <h2 className="section-title">Your ID Tells the Whole Story</h2>
        <p className="section-sub" style={{ marginBottom:40 }}>A 10-character ID that encodes your role, district, and serial number.</p>
        <button className="btn-primary" onClick={() => onNav('uid')}>🔑 Try UID Generator →</button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background:'#1A2B1A', color:'rgba(255,255,255,0.5)',
        padding:'36px 60px', display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800, color:'white', marginBottom:4 }}>🌿 AgriSmart</div>
          <div style={{ fontSize:13 }}>AI-Powered Digital Mandi — Empowering Indian Farmers</div>
        </div>
        <div style={{ fontSize:12 }}>Phase 1 · MERN Stack · Gemini AI</div>
      </footer>
    </div>
  );
}
