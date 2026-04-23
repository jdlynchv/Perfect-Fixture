/**
 * Market Intelligence Service
 * ─────────────────────────────────────────────────────────────
 * Baltic indices, freight rates, BDI forecast
 * TO CONNECT: add BALTIC_API_KEY or FREIGHTOS_API_KEY to .env
 */
const config = require('../lib/config');
const { MOCK_INDICES, MOCK_FREIGHT_RATES, MOCK_BDI_FORECAST } = require('../lib/mockData');

async function getIndices() {
  if (config.isConfigured('baltic')) {
    return fetchFromBalticExchange();
  }
  if (config.isConfigured('freightos')) {
    return fetchFromFreightos();
  }
  return MOCK_INDICES;
}

async function getFreightRates(segment) {
  // TODO: Baltic Exchange provides route-specific rates via their API
  let rates = MOCK_FREIGHT_RATES;
  if (segment) rates = rates.filter(r => r.segment === segment);
  return rates;
}

async function getBdiForecast() {
  // TODO: Replace with ML model endpoint or 3rd party forecast API
  return MOCK_BDI_FORECAST;
}

async function getMarketSummary() {
  const [indices, rates, forecast] = await Promise.all([
    getIndices(),
    getFreightRates(),
    getBdiForecast(),
  ]);
  return { indices, rates, forecast, timestamp: new Date().toISOString() };
}

// ── Baltic Exchange ───────────────────────────────────────────
// Docs: https://www.balticexchange.com/en/data-services.html
async function fetchFromBalticExchange() {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.baltic;

  const res  = await fetch('https://api.balticexchange.com/api/v1/indices', {
    headers: { 'Authorization': `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Baltic Exchange: ${res.status}`);
  const json = await res.json();

  // Map Baltic Exchange schema → internal schema (property names TBC with actual API docs)
  return (json.indices || []).map(idx => ({
    code:      idx.code,
    name:      idx.name,
    value:     idx.value,
    change:    idx.daily_change,
    changePct: idx.daily_change_pct,
  }));
}

// ── Freightos FBX ─────────────────────────────────────────────
// Docs: https://fbx.freightos.com
async function fetchFromFreightos() {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.freightos;

  const res  = await fetch('https://fbx.freightos.com/api/v2/indices', {
    headers: { 'x-api-key': key },
  });
  if (!res.ok) throw new Error(`Freightos FBX: ${res.status}`);
  const json = await res.json();
  return json.data || MOCK_INDICES;
}

module.exports = { getIndices, getFreightRates, getBdiForecast, getMarketSummary };
