/**
 * API Client — The Perfect Fixture
 * ─────────────────────────────────────────────────────────────
 * All fetch calls go through here. Never use fetch() directly
 * in section files — always call these methods.
 *
 * BASE_URL auto-detects dev vs production.
 */

const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/v1'
  : '/api/v1';

// ── Generic fetch wrapper ─────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res  = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  } catch (err) {
    console.warn(`[API] ${path} failed — using mock fallback`, err.message);
    // Return null; callers will use local MOCK_DATA as fallback
    return null;
  }
}

// ── Vessels ───────────────────────────────────────────────────
const Vessels = {
  list:   (filters = {}) => apiFetch(`/vessels?${new URLSearchParams(filters)}`),
  count:  ()              => apiFetch('/vessels/count'),
  get:    (mmsi)          => apiFetch(`/vessels/${mmsi}`),
};

// ── Voyage ────────────────────────────────────────────────────
const Voyage = {
  calculate: (params) => apiFetch('/voyage/calculate', {
    method: 'POST',
    body:   JSON.stringify(params),
  }),
};

// ── Market ────────────────────────────────────────────────────
const Market = {
  summary:  ()        => apiFetch('/market'),
  indices:  ()        => apiFetch('/market/indices'),
  rates:    (segment) => apiFetch(`/market/rates${segment ? `?segment=${segment}` : ''}`),
  forecast: ()        => apiFetch('/market/forecast'),
};

// ── Fuel ──────────────────────────────────────────────────────
const Fuel = {
  prices: (filters = {}) => apiFetch(`/fuel?${new URLSearchParams(filters)}`),
};

// ── Fixtures ──────────────────────────────────────────────────
const Fixtures = {
  list:       (filters = {})     => apiFetch(`/fixtures?${new URLSearchParams(filters)}`),
  get:        (id)               => apiFetch(`/fixtures/${id}`),
  create:     (data)             => apiFetch('/fixtures', { method: 'POST', body: JSON.stringify(data) }),
  updateTerm: (id, termData)     => apiFetch(`/fixtures/${id}/terms`, { method: 'PATCH', body: JSON.stringify(termData) }),
  updateStatus: (id, status)    => apiFetch(`/fixtures/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ── Risk ──────────────────────────────────────────────────────
const Risk = {
  list:          (filters = {})     => apiFetch(`/risk?${new URLSearchParams(filters)}`),
  ports:         ()                  => apiFetch('/risk/ports'),
  routeScore:    (load, disch)       => apiFetch(`/risk/route?load=${load}&disch=${disch}`),
};

// ── Cargo ─────────────────────────────────────────────────────
const Cargo = {
  list:   (filters = {}) => apiFetch(`/cargo?${new URLSearchParams(filters)}`),
  get:    (id)            => apiFetch(`/cargo/${id}`),
  create: (data)          => apiFetch('/cargo', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Health ────────────────────────────────────────────────────
const Health = {
  check: () => fetch(`${BASE_URL.replace('/v1', '')}/health`).then(r => r.json()).catch(() => null),
};

window.API = { Vessels, Voyage, Market, Fuel, Fixtures, Risk, Cargo, Health, BASE_URL };
