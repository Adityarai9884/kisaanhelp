// pages/WeatherPage.jsx — Phase 4: Live weather + AI advice
import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

const DISTRICTS = ['Ayodhya', 'Mathura', 'Agra', 'Delhi'];
const CROPS     = ['Wheat', 'Rice', 'Mustard', 'Sugarcane', 'Cotton', 'Soybean'];

const URGENCY_STYLE = {
  immediate: { bg: 'linear-gradient(135deg,#C62828,#E53935)', badge: '#FFCDD2', badgeText: '#C62828', label: '🚨 ACT NOW' },
  soon:      { bg: 'linear-gradient(135deg,#E65100,#F4511E)', badge: '#FFE0B2', badgeText: '#E65100', label: '⚡ URGENT'  },
  normal:    { bg: 'linear-gradient(135deg,#1B5E20,#2D6A2F)', badge: '#C8E6C9', badgeText: '#1B5E20', label: '✅ NORMAL'  },
};

export default function WeatherPage({ user }) {
  const [district,  setDistrict]  = useState(user?.district || 'Ayodhya');
  const [crop,      setCrop]      = useState('Wheat');
  const [weather,   setWeather]   = useState(null);
  const [advice,    setAdvice]    = useState(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => { fetchWeather(); }, [district]);

  async function fetchWeather() {
    setLoading(true);
    try {
      const data = await aiAPI.weather(district, crop);
      setWeather(data.weatherData);
      setAdvice(data.advice);
    } catch (_) {
      // Fallback mock weather
      setWeather({
        district,
        current: { temp: 32, feelsLike: 34, humidity: 45, description: 'Clear sky', icon: '☀️', windSpeed: 12 },
        forecast: [
          { date: 'Today',    temp: 32, icon: '☀️',  description: 'Clear',       rain: false, rainChance: 10 },
          { date: 'Tomorrow', temp: 30, icon: '⛅',  description: 'Cloudy',      rain: false, rainChance: 25 },
          { date: 'Thu',      temp: 26, icon: '🌧️', description: 'Heavy rain',  rain: true,  rainChance: 85 },
          { date: 'Fri',      temp: 23, icon: '⛈️', description: 'Thunderstorm',rain: true,  rainChance: 90 },
          { date: 'Sat',      temp: 28, icon: '⛅',  description: 'Clearing',    rain: false, rainChance: 30 },
        ],
        source: 'demo',
      });
      setAdvice({
        urgency: 'soon', action: 'TRANSPORT TODAY',
        title: 'Rain Expected Thursday',
        advice: `Heavy rain is predicted in ${district} from Thursday. Complete all harvesting and transport your ${crop} to the Mandi by Wednesday evening to avoid crop damage.`,
        riskLevel: 'medium',
      });
    } finally { setLoading(false); }
  }

  async function getAIAdvice() {
    if (!weather) return;
    setLoading(true);
    try {
      const data = await aiAPI.weather(district, crop);
      if (data.advice) setAdvice(data.advice);
    } catch (_) {}
    finally { setLoading(false); }
  }

  const urgencyStyle = advice ? (URGENCY_STYLE[advice.urgency] || URGENCY_STYLE.normal) : null;

  return (
    <div style={{ paddingTop: 'var(--navbar-h)', padding: '80px 60px' }}>
      <div className="section-tag">Live Weather + AI Advisory</div>
      <h2 className="section-title">Weather Advisory</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
        Live weather data for your district, combined with Gemini AI's harvest and transport recommendations.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">District</label>
          <select className="form-select" value={district} onChange={e => { setDistrict(e.target.value); }}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">My Crop</label>
          <select className="form-select" value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">&nbsp;</label>
          <button className="btn-primary" style={{ padding: '12px 24px', opacity: loading ? 0.7 : 1 }}
            onClick={getAIAdvice} disabled={loading}>
            {loading ? '🤖 Analyzing...' : '🤖 Get AI Harvest Advice'}
          </button>
        </div>
        {weather?.source === 'demo' && (
          <div style={{ alignSelf: 'flex-end', padding: '12px 16px', background: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: 10, fontSize: 13, color: '#633806' }}>
            ⚠️ Demo data — add WEATHER_API_KEY for live weather
          </div>
        )}
      </div>

      {weather && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Current weather */}
            <div style={{ background: 'linear-gradient(135deg,#0277BD,#01579B)', borderRadius: 16, padding: 28, color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, opacity: .7, marginBottom: 6 }}>Current · {weather.district}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 56, fontWeight: 800, lineHeight: 1 }}>
                    {weather.current.icon} {weather.current.temp}°C
                  </div>
                  <div style={{ fontSize: 14, opacity: .8, marginTop: 6, textTransform: 'capitalize' }}>{weather.current.description}</div>
                </div>
                <div style={{ textAlign: 'right', opacity: .8, fontSize: 13 }}>
                  <div>Feels like {weather.current.feelsLike}°C</div>
                  <div>Humidity {weather.current.humidity}%</div>
                  <div>Wind {weather.current.windSpeed} km/h</div>
                </div>
              </div>
            </div>

            {/* 5-day forecast */}
            <div className="card">
              <div className="card-head"><span className="card-title">5-Day Forecast</span></div>
              <div className="card-body" style={{ padding: '8px 20px' }}>
                {weather.forecast.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < weather.forecast.length - 1 ? '1px solid var(--bg)' : 'none',
                    background: f.rain ? '#FFF8E1' : 'transparent',
                    borderRadius: f.rain ? 8 : 0,
                    paddingLeft: f.rain ? 8 : 0,
                    paddingRight: f.rain ? 8 : 0,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14, width: 80 }}>{f.date}</div>
                    <div style={{ fontSize: 22 }}>{f.icon}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', flex: 1, marginLeft: 12, textTransform: 'capitalize' }}>{f.description}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{f.temp}°C</div>
                      {f.rain && <div style={{ fontSize: 11, color: '#BA7517', fontWeight: 600 }}>🌧 {f.rainChance}% rain</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — AI advice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {advice && urgencyStyle && (
              <div style={{ background: urgencyStyle.bg, borderRadius: 16, padding: 28, color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ background: urgencyStyle.badge, color: urgencyStyle.badgeText, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6 }}>
                    {urgencyStyle.label}
                  </span>
                  <span style={{ fontSize: 13, opacity: .8 }}>AI Advisory for {crop}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
                  {advice.action}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, opacity: .9 }}>{advice.advice}</div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <span style={{ background: 'rgba(255,255,255,0.15)', fontSize: 12, padding: '4px 12px', borderRadius: 999 }}>
                    Risk: {advice.riskLevel}
                  </span>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🌾 General Farming Tips</div>
              {[
                { icon:'🌧️', tip:'Harvest before rain — moisture increases crop weight but reduces quality and mandi price.' },
                { icon:'🌡️', tip:`Temperature above 40°C speeds ripening. Monitor ${crop} closely in summer.` },
                { icon:'🚛', tip:'Plan transport 24h in advance. Incharge needs prior gate entry notification.' },
                { icon:'💧', tip:'After rain, wait at least 48h before transporting to avoid mould and weight issues.' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
