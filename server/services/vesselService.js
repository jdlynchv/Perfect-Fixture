/**
 * Vessel Service
 * ─────────────────────────────────────────────────────────────
 * Fetches vessel data from AIS providers.
 * Falls back to mock data when no API key is configured.
 *
 * TO CONNECT A REAL AIS API:
 *  1. Add your key to .env  (MARINETRAFFIC_API_KEY or similar)
 *  2. Uncomment the relevant fetchFrom*() function below
 *  3. config.isConfigured() will automatically route to the real API
 */
const config  = require('../lib/config');
const { MOCK_VESSELS, MOCK_VESSEL_COUNT } = require('../lib/mockData');

// ── Public API ────────────────────────────────────────────────

async function getVessels(filters = {}) {
  let vessels;

  if (config.isConfigured('marineTraffic')) {
    vessels = await fetchFromMarineTraffic(filters);
  } else if (config.isConfigured('vesselFinder')) {
    vessels = await fetchFromVesselFinder(filters);
  } else {
    vessels = MOCK_VESSELS;
  }

  return applyFilters(vessels, filters);
}

async function getVesselByMmsi(mmsi) {
  if (config.isConfigured('marineTraffic')) {
    return fetchVesselDetailFromMT(mmsi);
  }
  return MOCK_VESSELS.find(v => v.mmsi === mmsi) || null;
}

async function getVesselCount() {
  // TODO: replace with real count from AIS provider
  return MOCK_VESSEL_COUNT;
}

// ── MarineTraffic Integration ──────────────────────────────────
// Docs: https://www.marinetraffic.com/en/ais-api-services/documentation
async function fetchFromMarineTraffic(filters) {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.marineTraffic;

  const params = new URLSearchParams({
    v:        2,
    apikey:   key,
    protocol: 'jsono',
    msgtype:  'extended',
    ...(filters.type   && { shiptype: mapTypeToMT(filters.type)   }),
    ...(filters.region && { area_code: filters.region              }),
  });

  const url = `https://services.marinetraffic.com/api/getVesselPositionsV2/0/${params}`;
  const res  = await fetch(url);
  const json = await res.json();

  if (!res.ok) throw new Error(`MarineTraffic error: ${json.errors?.[0]?.detail || res.status}`);

  // Normalise MT response to our schema
  return (json.DATA || []).map(v => ({
    mmsi:     v.MMSI,
    imo:      v.IMO,
    name:     v.SHIPNAME,
    type:     v.SHIPTYPE,  // MT type code — map as needed
    dwt:      null,        // not in position call, use vessel details
    lat:      parseFloat(v.LAT),
    lng:      parseFloat(v.LON),
    speed:    parseFloat(v.SPEED) / 10,
    heading:  parseInt(v.HEADING),
    status:   mapNavStatus(v.STATUS),
    nextPort: v.NEXT_PORT_NAME,
    etaUtc:   v.ETA,
    draught:  parseFloat(v.DRAUGHT),
  }));
}

// ── VesselFinder Integration ───────────────────────────────────
// Docs: https://www.vesselfinder.com/api/docs
async function fetchFromVesselFinder(filters) {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.vesselFinder;
  const res  = await fetch(
    `https://api.vesselfinder.com/vessels?userkey=${key}&format=json`
  );
  const json = await res.json();
  // Map VF schema → internal schema here
  return (json.data || []).map(v => ({ /* ... mapping ... */ }));
}

async function fetchVesselDetailFromMT(mmsi) {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.marineTraffic;
  const res  = await fetch(
    `https://services.marinetraffic.com/api/vesselDetails/0?v=5&apikey=${key}&mmsi=${mmsi}&protocol=jsono`
  );
  const json = await res.json();
  return json.DATA?.[0] || null;
}

// ── Helpers ──────────────────────────────────────────────────
function mapNavStatus(code) {
  const map = { 0: 'laden', 1: 'port', 5: 'port', 8: 'ballast' };
  return map[parseInt(code)] || 'laden';
}

function mapTypeToMT(type) {
  const map = { Capesize: '71', Panamax: '72', Supramax: '73', Handysize: '79' };
  return map[type] || '';
}

function applyFilters(vessels, filters) {
  let result = [...vessels];
  if (filters.type   ) result = result.filter(v => v.type   === filters.type   );
  if (filters.status ) result = result.filter(v => v.status === filters.status );
  if (filters.minDwt ) result = result.filter(v => v.dwt    >= filters.minDwt  );
  if (filters.maxDwt ) result = result.filter(v => v.dwt    <= filters.maxDwt  );
  return result;
}

module.exports = { getVessels, getVesselByMmsi, getVesselCount };
