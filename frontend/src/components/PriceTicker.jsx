// components/PriceTicker.jsx
import React from 'react';
import { TICKER_ITEMS } from '../data/mockData';

export default function PriceTicker() {
  // Double the array so the scroll loop is seamless
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{
      background: '#1A2B1A',
      padding: '11px 0',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: 'var(--navbar-h)',
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        animation: 'ticker 32s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '0 36px',
            display: 'inline-flex',
            gap: 10,
            alignItems: 'center',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{item.crop}</span>
            <span>{item.price}</span>
            <span style={{ color: item.up ? '#66BB6A' : '#EF5350', fontSize: 12 }}>
              {item.up ? '▲' : '▼'} {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
