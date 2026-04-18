// App.jsx — Root component (Phase 4: AI + Weather fully integrated)
import React, { useState, useCallback, useEffect } from 'react';
import './styles/globals.css';
import './styles/components.css';

import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar               from './components/Navbar';
import AuthModal            from './components/AuthModal';
import Toast                from './components/Toast';
import AIChat               from './components/AIChat';

import Landing              from './pages/Landing';
import MarketPage           from './pages/MarketPage';
import TransportPage        from './pages/TransportPage';
import UIDPage              from './pages/UIDPage';
import AIPricePage          from './pages/AIPricePage';
import WeatherPage          from './pages/WeatherPage';
import FarmerDashboard      from './pages/farmer/FarmerDashboard';
import WholesalerDashboard  from './pages/wholesaler/WholesalerDashboard';
import InchargeDashboard    from './pages/incharge/InchargeDashboard';

// ── Inner app (has access to AuthContext) ─────
function AppInner() {
  const { currentUser, loading, login, register, logout } = useAuth();
  const [page,  setPage]  = useState('landing');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((icon, msg) => setToast({ icon, msg }), []);

  // Auto-route when user logs in
  useEffect(() => {
    if (!currentUser) return;
    const rolePageMap = {
      farmer:     'farmer',
      wholesaler: 'wholesaler',
      incharge:   'incharge',
      buyer:      'market',
      admin:      'market',
    };
    setPage(rolePageMap[currentUser.role] || 'landing');
  }, [currentUser]);

  function navigate(target) {
    const protectedPages = ['farmer', 'wholesaler', 'incharge'];
    if (protectedPages.includes(target) && !currentUser) {
      setModal('login');
      return;
    }
    setPage(target);
    window.scrollTo(0, 0);
  }

  async function handleLogin(payload) {
    try {
      await login(payload);
      setModal(null);
      showToast('✅', `Welcome back!`);
    } catch (err) {
      showToast('❌', err.message || 'Login failed');
    }
  }

  async function handleRegister(payload) {
    try {
      const user = await register(payload);
      setModal(null);
      showToast('🎉', `Welcome! Your AgriSmart ID: ${user.uid}`);
    } catch (err) {
      showToast('❌', err.message || 'Registration failed');
    }
  }

  function handleLogout() {
    logout();
    setPage('landing');
    showToast('👋', 'Logged out successfully');
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:18, color:'var(--green)' }}>
          🌿 Loading AgriSmart...
        </div>
      </div>
    );
  }

  const commonProps = { user: currentUser, onToast: showToast, onLogout: handleLogout };
  const isDashboard = ['farmer','wholesaler','incharge'].includes(page);

  return (
    <>
      {!isDashboard && (
        <Navbar
          currentPage={page}
          currentUser={currentUser}
          onNav={navigate}
          onLogin={() => setModal('login')}
          onRegister={() => setModal('register')}
          onLogout={handleLogout}
        />
      )}

      {page === 'landing'    && <Landing    onRegister={() => setModal('register')} onNav={navigate} />}
      {page === 'market'     && <MarketPage onToast={showToast} />}
      {page === 'transport'  && <TransportPage onToast={showToast} />}
      {page === 'uid'        && <UIDPage />}
      {page === 'ai-price'   && <AIPricePage  user={currentUser} />}
      {page === 'weather'    && <WeatherPage   user={currentUser} />}

      {page === 'farmer'     && <FarmerDashboard     {...commonProps} />}
      {page === 'wholesaler' && <WholesalerDashboard  {...commonProps} />}
      {page === 'incharge'   && <InchargeDashboard    {...commonProps} />}

      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <AIChat user={currentUser} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
