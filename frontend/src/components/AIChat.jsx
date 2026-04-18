// components/AIChat.jsx — Phase 4: Real Gemini-powered chatbot
import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { CHAT_REPLIES } from '../data/mockData';

export default function AIChat({ user }) {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Namaste! 🙏 I'm Krishi AI, powered by Google Gemini. Ask me about crop prices, weather alerts, or transport." },
    { from: 'bot', text: 'Try: "What\'s the wheat price?" or "Should I harvest today?" or "How do I list a crop?"' },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setMessages(m => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const context = { role: user?.role || 'farmer', district: user?.district || 'Ayodhya' };
      const data = await aiAPI.chat(msg, context);
      setMessages(m => [...m, { from: 'bot', text: data.reply, source: data.source }]);
    } catch (_) {
      const lower = msg.toLowerCase();
      let reply = CHAT_REPLIES.default;
      for (const key of Object.keys(CHAT_REPLIES)) {
        if (lower.includes(key)) { reply = CHAT_REPLIES[key]; break; }
      }
      setMessages(m => [...m, { from: 'bot', text: reply, source: 'offline' }]);
    } finally { setLoading(false); }
  }

  const quickActions = ['Wheat price', 'Weather today', 'Book transport', 'List a crop'];

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        position:'fixed', bottom:32, right:32, zIndex:900,
        width:56, height:56, borderRadius:'50%',
        background:'var(--green)', color:'white', border:'none',
        fontSize:24, boxShadow:'0 8px 24px rgba(45,106,47,0.4)',
        transition:'all 0.2s', cursor:'pointer',
      }}>🤖</button>

      {open && (
        <div style={{
          position:'fixed', bottom:100, right:32, zIndex:900,
          width:348, background:'white', borderRadius:20,
          boxShadow:'0 16px 60px rgba(0,0,0,0.15)',
          border:'1px solid var(--border)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          animation:'fadeUp 0.28s ease',
        }}>
          <div style={{ background:'var(--green)', color:'white', padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>Krishi AI</div>
              <div style={{ fontSize:11, opacity:.75 }}>⚡ Powered by Google Gemini</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', fontSize:18, cursor:'pointer' }}>✕</button>
          </div>

          <div style={{ padding:'16px', height:260, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from==='bot'?'flex-start':'flex-end', maxWidth:'88%' }}>
                <div style={{
                  padding:'9px 13px', borderRadius:14, fontSize:13, lineHeight:1.55,
                  background: m.from==='bot'?'var(--bg)':'var(--green)',
                  color: m.from==='bot'?'var(--text)':'white',
                  borderBottomLeftRadius:  m.from==='bot'  ? 4 : 14,
                  borderBottomRightRadius: m.from==='user' ? 4 : 14,
                }}>{m.text}</div>
                {m.source === 'gemini' && <div style={{ fontSize:10, color:'var(--muted)', marginTop:2, textAlign:'right' }}>⚡ Gemini</div>}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf:'flex-start' }}>
                <div style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:14, borderBottomLeftRadius:4, fontSize:13, color:'var(--muted)' }}>
                  Krishi AI is thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding:'0 12px 8px', display:'flex', gap:6, flexWrap:'wrap' }}>
            {quickActions.map(q => (
              <button key={q} onClick={() => setInput(q)} style={{
                fontSize:11, padding:'4px 10px', borderRadius:999,
                border:'1px solid var(--border)', background:'var(--bg)',
                cursor:'pointer', color:'var(--green)', fontWeight:600, fontFamily:'var(--font-body)',
              }}>{q}</button>
            ))}
          </div>

          <div style={{ display:'flex', gap:8, padding:'10px 14px', borderTop:'1px solid var(--border)' }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder="Ask Krishi AI anything..."
              style={{ flex:1, padding:'9px 13px', border:'1.5px solid var(--border)', borderRadius:10, fontSize:13, outline:'none', fontFamily:'var(--font-body)' }}
            />
            <button onClick={send} disabled={loading} style={{ background:loading?'var(--muted)':'var(--green)', color:'white', border:'none', width:36, height:36, borderRadius:8, fontSize:16, cursor:loading?'not-allowed':'pointer' }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
