// src/services/api.js
// ─────────────────────────────────────────────
// Central API service — all fetch() calls live here.
// Phase 1: returns mock data (imported from mockData.js)
// Phase 2: hits the real Express backend
// ─────────────────────────────────────────────

// const BASE = process.env.REACT_APP_API_URL;
const BASE = "https://kisaanhelp.onrender.com/api";

// ── JWT helpers ───────────────────────────────
export function getToken() {
  return localStorage.getItem('agrismart_token');
}
function setToken(t) {
  localStorage.setItem('agrismart_token', t);
}
export function clearToken() {
  localStorage.removeItem('agrismart_token');
}

// ── Base fetch wrapper ────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

const get  = (path)         => request(path);
const post = (path, body)   => request(path, { method: 'POST',  body: JSON.stringify(body) });
const patch= (path, body)   => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const del  = (path)         => request(path, { method: 'DELETE' });

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════
export const authAPI = {
  register: async (payload) => {
    const data = await post('/auth/register', payload);
    setToken(data.token);
    return data;
  },
  login: async (payload) => {
    const data = await post('/auth/login', payload);
    setToken(data.token);
    return data;
  },
  me: () => get('/auth/me'),
  logout: () => clearToken(),
};

// ══════════════════════════════════════════════
// CROPS
// ══════════════════════════════════════════════
export const cropsAPI = {
  list:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/crops${qs ? '?' + qs : ''}`);
  },
  mine:    ()           => get('/crops/mine'),
  get:     (id)         => get(`/crops/${id}`),
  create:  (body)       => post('/crops', body),
  update:  (id, body)   => patch(`/crops/${id}`, body),
  remove:  (id)         => del(`/crops/${id}`),
  setStatus: (id, status) => patch(`/crops/${id}/status`, { status }),
};

// ══════════════════════════════════════════════
// TRANSPORT
// ══════════════════════════════════════════════
export const transportAPI = {
  suggest: (kg)  => post('/transport/suggest', { kg }),
  book:    (body) => post('/transport/book', body),
  mine:    ()    => get('/transport/mine'),
  arrivals: ()   => get('/transport/arrivals'),
  approve: (id)  => patch(`/transport/${id}/approve`),
  reject:  (id)  => patch(`/transport/${id}/reject`),
};

// ══════════════════════════════════════════════
// MANDI
// ══════════════════════════════════════════════
export const mandiAPI = {
  rates:        (district) => get(`/mandi/rates${district ? '?district=' + district : ''}`),
  publishRates: (district, rates) => post('/mandi/rates', { district, rates }),
  stock:        (district) => get(`/mandi/stock${district ? '?district=' + district : ''}`),
};

// ══════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════
export const usersAPI = {
  me:        ()     => get('/users/me'),
  updateMe:  (body) => patch('/users/me', body),
  lookupUID: (uid)  => get(`/users/${uid}`),
  list:      (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/users${qs ? '?' + qs : ''}`);
  },
};

// ══════════════════════════════════════════════
// ORDERS (Phase 3)
// ══════════════════════════════════════════════
export const ordersAPI = {
  place:    (body)         => post('/orders', body),
  mine:     ()             => get('/orders/mine'),
  get:      (id)           => get(`/orders/${id}`),
  all:      (params = {})  => { const qs = new URLSearchParams(params).toString(); return get(`/orders${qs ? '?' + qs : ''}`); },
  confirm:  (id)           => patch(`/orders/${id}/confirm`),
  reject:   (id, reason)   => patch(`/orders/${id}/reject`, { reason }),
  cancel:   (id)           => patch(`/orders/${id}/cancel`),
  payment:  (id, body)     => patch(`/orders/${id}/payment`, body),
};

// ══════════════════════════════════════════════
// NOTIFICATIONS (Phase 3)
// ══════════════════════════════════════════════
export const notificationsAPI = {
  mine:    ()   => get('/notifications'),
  readAll: ()   => patch('/notifications/read-all'),
  readOne: (id) => patch(`/notifications/${id}/read`),
};

// ══════════════════════════════════════════════
// AI / GEMINI (Phase 4)
// ══════════════════════════════════════════════
export const aiAPI = {
  pricePrediction: (crop, district)    => post('/ai/price-prediction', { crop, district }),
  weather:         (district, crop)    => get(`/ai/weather/${district}${crop ? '?crop=' + crop : ''}`),
  chat:            (message, context)  => post('/ai/chat', { message, context }),
  demandCheck:     (crop, district)    => get(`/ai/demand-check?crop=${crop}&district=${district}`),
};
