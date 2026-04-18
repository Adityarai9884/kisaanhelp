// components/OrderCard.jsx — Reusable order display card
import React from 'react';

const STATUS_STYLE = {
  pending:         { background: '#FFF8E1', color: '#6D4C00',  label: '⏳ Pending'          },
  confirmed:       { background: '#E8F5E9', color: '#2D6A2F',  label: '✅ Confirmed'         },
  payment_pending: { background: '#E3F2FD', color: '#0277BD',  label: '💳 Payment Pending'  },
  completed:       { background: '#E8EAF6', color: '#3949AB',  label: '🎉 Completed'         },
  cancelled:       { background: '#FFEBEE', color: '#C62828',  label: '❌ Cancelled'         },
};

export default function OrderCard({ order, role, onConfirm, onReject, onCancel, onPayment }) {
  const s = STATUS_STYLE[order.status] || STATUS_STYLE.pending;

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20, marginBottom: 12,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>
            {order.cropName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {role === 'farmer' ? `Buyer: ${order.buyerUid}` : `Farmer: ${order.farmerUid}`}
            {' · '}{order.district}
          </div>
        </div>
        <span style={{
          ...s, fontSize: 11, fontWeight: 700,
          padding: '4px 10px', borderRadius: 999,
        }}>{s.label}</span>
      </div>

      {/* Details row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 12, marginBottom: 14,
        background: 'var(--bg)', borderRadius: 10, padding: '12px 16px',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Quantity</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{order.quantity} Qtl</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Price/Qtl</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>₹{(order.pricePerQtl || 0).toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Total Amount</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--green)' }}>
            ₹{(order.totalAmount || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Payment bar */}
      {order.status === 'confirmed' || order.status === 'completed' ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: 'var(--muted)' }}>Payment</span>
            <span style={{ fontWeight: 600, color: order.paymentStatus === 'paid' ? 'var(--green)' : '#BA7517' }}>
              ₹{(order.paidAmount || 0).toLocaleString()} / ₹{(order.totalAmount || 0).toLocaleString()}
            </span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: order.paymentStatus === 'paid' ? 'var(--green)' : 'var(--gold)',
              width: `${Math.min(100, ((order.paidAmount || 0) / (order.totalAmount || 1)) * 100)}%`,
              transition: 'width 0.4s',
            }} />
          </div>
        </div>
      ) : null}

      {/* Buyer note */}
      {order.buyerNote && (
        <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 12 }}>
          📝 "{order.buyerNote}"
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/* Farmer actions on pending order */}
        {role === 'farmer' && order.status === 'pending' && (
          <>
            <button className="btn-primary btn-sm" onClick={() => onConfirm(order._id)}>
              ✓ Confirm Order
            </button>
            <button className="btn-danger btn-sm" onClick={() => onReject(order._id)}>
              ✕ Reject
            </button>
          </>
        )}

        {/* Farmer records payment */}
        {role === 'farmer' && order.status === 'confirmed' && order.paymentStatus !== 'paid' && (
          <button className="btn-primary btn-sm" onClick={() => onPayment(order)}>
            💰 Record Payment
          </button>
        )}

        {/* Buyer/wholesaler can cancel pending orders */}
        {(role === 'buyer' || role === 'wholesaler') && order.status === 'pending' && (
          <button className="btn-danger btn-sm" onClick={() => onCancel(order._id)}>
            Cancel Order
          </button>
        )}

        <div style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', marginLeft: 'auto' }}>
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
