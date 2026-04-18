// pages/AIPricePage.jsx — Phase 4: Live Gemini price predictions
import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { PRICE_PREDICTIONS, WHEAT_PRICES_30D } from '../data/mockData';

const CROPS     = ['Wheat', 'Rice', 'Mustard', 'Sugarcane', 'Cotton', 'Soybean'];
const DISTRICTS = ['Ayodhya', 'Mathura', 'Agra', 'Delhi'];

const TREND_COLOR = { rising: '#2E7D32', falling: '#C62828', stable: '#BA7517' };
const TREND_ICON  = { rising: '📈', falling: '📉', stable: '➡️' };
const REC_COLOR   = {
  'SELL NOW':      { bg: '#FFEBEE', color: '#C62828', icon: '⚡' },
  'HOLD 3-5 DAYS': { bg: '#FFF8E1', color: '#6D4C00', icon: '⏸' },
  'HOLD 7+ DAYS':  { bg: '#E8F5E9', color: '#2D6A2F', icon: '🕐' },
};

function MiniChart() {
  const prices = WHEAT_PRICES_30D;
  const max = Math.max(...prices), min = Math.min(...prices);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
      {prices.map((p, i) => {
        const h = Math.round(((p - min) / (max - min)) * 56 + 8);
        return (
          <div key={i} style={{
            flex: 1, height: h, borderRadius: '2px 2px 0 0',
            background: i >= 28 ? 'var(--green)' : 'var(--green-pale)',
            minHeight: 4,
          }} />
        );
      })}
    </div>
  );
}

export default function AIPricePage({ user }) {
  const [crop,       setCrop]       = useState('Wheat');
  const [district,   setDistrict]   = useState(user?.district || 'Ayodhya');
  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  async function fetchPrediction() {
    setLoading(true);
    setError('');
    try {
      const data = await aiAPI.pricePrediction(crop, district);
      setPrediction(data);
    } catch (err) {
      // Fallback to mock data
      const fallback = PRICE_PREDICTIONS[crop];
      if (fallback) {
        setPrediction({
          crop, district,
          prediction: {
            predictedPrice: parseInt(fallback.range.split('–')[1].replace(/[₹,\s]/g, '')),
            minPrice:       parseInt(fallback.range.split('–')[0].replace(/[₹,\s]/g, '')),
            maxPrice:       parseInt(fallback.range.split('–')[1].replace(/[₹,\s]/g, '')),
            trend:          fallback.action === 'SELL NOW' ? 'stable' : 'rising',
            recommendation: fallback.action === 'SELL NOW' ? 'SELL NOW' : 'HOLD 3-5 DAYS',
            reasoning:      fallback.note,
            confidence:     'medium',
          },
          source: 'fallback',
        });
      } else {
        setError('Could not fetch prediction. Please try again.');
      }
    } finally { setLoading(false); }
  }

  const pred = prediction?.prediction;
  const rec  = pred ? (REC_COLOR[pred.recommendation] || REC_COLOR['HOLD 3-5 DAYS']) : null;

  return (
    <div style={{ paddingTop: 'var(--navbar-h)', padding: '80px 60px' }}>
      <div className="section-tag">AI Price Intelligence</div>
      <h2 className="section-title">Gemini Price Prediction</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 40, lineHeight: 1.7, maxWidth: 560 }}>
        Select a crop and district — our AI reads 30 days of Mandi data and tells you whether to sell now or hold for a better price.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">Crop</label>
          <select className="form-select" value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">District</label>
          <select className="form-select" value={district} onChange={e => setDistrict(e.target.value)}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
          <label className="form-label">&nbsp;</label>
          <button className="btn-primary" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
            onClick={fetchPrediction} disabled={loading}>
            {loading ? '🤖 Analyzing...' : '🤖 Get AI Prediction'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 10, padding: '14px 18px', color: '#C62828', marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {pred && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, animation: 'fadeUp 0.4s ease' }}>
          {/* Main prediction card */}
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>AI Predicted Price · {prediction.crop} · {prediction.district}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 48, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
                  ₹{(pred.predictedPrice || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>per quintal</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: TREND_COLOR[pred.trend] + '22', color: TREND_COLOR[pred.trend], padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  {TREND_ICON[pred.trend]} {pred.trend?.toUpperCase()}
                </span>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Confidence: {pred.confidence}</div>
              </div>
            </div>

            {/* Price range */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Low Estimate</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: '#C62828' }}>₹{(pred.minPrice || 0).toLocaleString()}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>High Estimate</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: '#2E7D32' }}>₹{(pred.maxPrice || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Recommendation */}
            <div style={{ background: rec.bg, border: `1px solid ${rec.color}33`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{rec.icon}</span>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: rec.color }}>
                  {pred.recommendation}
                </div>
              </div>
              <div style={{ fontSize: 14, color: rec.color, opacity: 0.85, lineHeight: 1.6 }}>{pred.reasoning}</div>
            </div>

            {prediction.source && (
              <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {prediction.source === 'live-data' ? '⚡ Based on real Mandi data' : prediction.source === 'fallback' ? '📊 AI estimate (offline mode)' : '🤖 Gemini AI powered'}
                {' · '}{prediction.dataPoints || 0} data points used
              </div>
            )}
          </div>

          {/* Chart + all crops */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>30-Day Price Trend</div>
              <MiniChart />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>30 days ago</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Today</span>
              </div>
            </div>

            {/* All crops quick view */}
            <div className="card">
              <div className="card-head"><span className="card-title">All Crops — Quick View</span></div>
              <div className="card-body" style={{ padding: '12px 20px' }}>
                {Object.entries(PRICE_PREDICTIONS).map(([c, p]) => (
                  <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{p.range}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!pred && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🤖</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
            Select a crop and click Get AI Prediction
          </div>
          <div style={{ fontSize: 14 }}>Gemini AI will analyze 30 days of Mandi data and give you a sell/hold recommendation.</div>
        </div>
      )}
    </div>
  );
}
