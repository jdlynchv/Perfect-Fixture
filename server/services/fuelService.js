/**
 * Fuel / Bunker Price Service
 * ─────────────────────────────────────────────────────────────
 * TO CONNECT:
 *  - Ship & Bunker: add SHIPANDBUNKER_API_KEY to .env
 *  - OilPrice API:  add OILPRICE_API_KEY to .env
 *  - EIA (free):    add EIA_API_KEY to .env
 */
const config = require('../lib/config');
const { MOCK_FUEL_PRICES } = require('../lib/mockData');

async function getFuelPrices(filters = {}) {
  if (config.isConfigured('shipAndBunker')) {
    return fetchFromShipAndBunker(filters);
  }
  if (config.isConfigured('oilPrice')) {
    return fetchFromOilPriceApi();
  }
  // Mock fallback
  let prices = MOCK_FUEL_PRICES;
  if (filters.grade) prices = prices.filter(p => p.grade === filters.grade);
  if (filters.port ) prices = prices.filter(p => p.portCode === filters.port);
  return prices;
}

// ── Ship & Bunker ─────────────────────────────────────────────
// Docs: https://shipandbunker.com/api
async function fetchFromShipAndBunker(filters) {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.shipAndBunker;

  const res  = await fetch('https://shipandbunker.com/api/v1/prices', {
    headers: { 'X-API-Key': key },
  });
  if (!res.ok) throw new Error(`ShipAndBunker: ${res.status}`);
  const json = await res.json();

  // Map to internal schema — adjust property names to match actual API response
  return (json.data || []).map(p => ({
    grade:      p.fuel_type,
    port:       p.port_name,
    portCode:   p.port_code,
    priceUsd:   p.price_usd,
    deltaDay:   p.change_day,
    deltaPct:   p.change_pct,
  }));
}

// ── OilPrice API ──────────────────────────────────────────────
// Docs: https://oilpriceapi.com/docs
async function fetchFromOilPriceApi() {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.oilPrice;

  const res  = await fetch('https://api.oilpriceapi.com/v1/prices/latest', {
    headers: { 'Authorization': `Token ${key}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`OilPriceAPI: ${res.status}`);
  const json = await res.json();

  // OilPrice API returns crude oil — use as reference for bunker estimates
  const crude = json.data?.price || 75;
  return MOCK_FUEL_PRICES.map(p => ({
    ...p,
    priceUsd: Math.round(crude * (p.grade === 'MGO' ? 9.8 : p.grade === 'VLSFO' ? 7.7 : 6.2)),
    _source: 'oilprice_derived',
  }));
}

// ── EIA (free, crude only) ────────────────────────────────────
async function fetchCrudeFromEia() {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.eia;
  const res  = await fetch(
    `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${key}&frequency=daily&data[0]=value&facets[product][]=EPCBRENT&sort[0][column]=period&sort[0][direction]=desc&length=1`
  );
  const json = await res.json();
  return json.response?.data?.[0]?.value || null;
}

module.exports = { getFuelPrices, fetchCrudeFromEia };
