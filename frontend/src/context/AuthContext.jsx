// src/context/AuthContext.jsx
// ─────────────────────────────────────────────
// Provides currentUser + auth actions to the whole app.
// Phase 2: talks to real backend via api.js
// ─────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);

  // On mount: if a token exists, fetch the current user
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(data => setCurrentUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload) => {
    const data = await authAPI.login(payload);
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authAPI.register(payload);
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
