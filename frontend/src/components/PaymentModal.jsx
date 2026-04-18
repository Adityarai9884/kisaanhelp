// components/PaymentModal.jsx
import React, { useState } from 'react';

export default function PaymentModal({ order, onClose, onSubmit }) {
  const [amount, setAmount]   = useState('');
  const [method, setMethod]   = useState('cash');
  const [busy,   setBusy]     = useState(false);

  const remaining = (order.totalAmount || 0) - (order.paidAmount || 0);

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) return;
    setBusy(true);
    try {
      await onSubmit(order._id, { paidAmount: Number(amount), paymentMethod: method });
      onClose();
    } finally { setBusy(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: 18, width: 400,
        padding: '32px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        animation: 'fadeUp 0.25s ease',
      }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
          💰 Record Payment
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Order: {order.cropName} · {order.quantity} Qtl · {order.buyerUid}
        </div>

        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>Total Amount</span>
            <span style={{ fontWeight: 700 }}>₹{order.totalAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 6 }}>
            <span>Already Paid</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>₹{(order.paidAmount || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Remaining</span>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{remaining.toLocaleString()}</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Amount Received (₹)</label>
          <input className="form-input" type="number" placeholder={`Up to ₹${remaining.toLocaleString()}`}
            value={amount} onChange={e => setAmount(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['cash', 'upi', 'bank'].map(m => (
              <div key={m} onClick={() => setMethod(m)} style={{
                flex: 1, textAlign: 'center', padding: '10px 8px',
                border: `1.5px solid ${method === m ? 'var(--green)' : 'var(--border)'}`,
                background: method === m ? 'var(--green-pale)' : 'transparent',
                color: method === m ? 'var(--green)' : 'var(--muted)',
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                textTransform: 'capitalize',
              }}>{m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" style={{ flex: 1, padding: 13, opacity: busy ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving...' : 'Record Payment'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
