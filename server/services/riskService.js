/**
 * Risk & Alerts Service
 * ─────────────────────────────────────────────────────────────
 * TO CONNECT:
 *  - GardAlert API: add GARDALERT_API_KEY to .env
 *  - ACLED API:     add ACLED_API_KEY + ACLED_EMAIL to .env
 */
const config = require('../lib/config');
const { MOCK_RISKS, MOCK_PORTS } = require('../lib/mockData');

async function getRisks(filters = {}) {
  let risks;

  if (config.isConfigured('gardAlert')) {
    risks = await fetchFromGardAlert();
  } else if (config.isConfigured('acled')) {
    risks = await fetchFromAcled();
  } else {
    risks = MOCK_RISKS;
  }

  if (filters.level) risks = risks.filter(r => r.level === filters.level.toUpperCase());
  if (filters.type ) risks = risks.filter(r => r.type  === filters.type);
  return risks;
}

async function getPortCongestion() {
  // TODO: PortWatch IMF API
  // GET https://portwatch.imf.org/api/port-congestion
  return MOCK_PORTS;
}

async function getRouteRiskScore(loadPort, dischPort) {
  const risks = await getRisks();
  // Simple scoring: count how many HIGH/MEDIUM risks overlap the route
  const high   = risks.filter(r => r.level === 'HIGH').length;
  const medium = risks.filter(r => r.level === 'MEDIUM').length;
  const score  = Math.min(100, high * 25 + medium * 10);

  return {
    loadPort, dischPort,
    score,
    level:         score > 50 ? 'HIGH' : score > 25 ? 'MEDIUM' : 'LOW',
    premiumPct:    risks.reduce((sum, r) => sum + (r.warRiskPremiumPct || 0), 0).toFixed(2),
    activeRisks:   risks.filter(r => r.level !== 'LOW').map(r => r.region),
  };
}

// ── GardAlert ────────────────────────────────────────────────
// https://www.gard.no/web/updates/content/29483/api-documentation
async function fetchFromGardAlert() {
  const { default: fetch } = await import('node-fetch');
  const key = config.apis.gardAlert;

  const res  = await fetch('https://api.gard.no/alerts/v1/active', {
    headers: { 'Authorization': `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`GardAlert: ${res.status}`);
  const json = await res.json();

  return (json.alerts || []).map(a => ({
    id:          a.id,
    region:      a.area_name,
    level:       mapGardSeverity(a.severity),
    type:        a.category?.toLowerCase() || 'conflict',
    description: a.description,
    warRiskPremiumPct: a.premium_pct || 0,
    updatedAt:   a.updated_at,
    bbox:        a.bounding_box,
  }));
}

// ── ACLED Conflict Data ───────────────────────────────────────
// https://acleddata.com/api/
async function fetchFromAcled() {
  const { default: fetch } = await import('node-fetch');
  const key   = config.apis.acled;
  const email = config.apis.acledEmail;

  const params = new URLSearchParams({
    key, email,
    event_type: 'Explosions/Remote violence',
    limit:      50,
    fields:     'event_date|region|country|event_type|fatalities|notes',
  });

  const res  = await fetch(`https://api.acleddata.com/acled/read?${params}`);
  const json = await res.json();

  // Aggregate ACLED events into risk zones
  return aggregateAcledToZones(json.data || []);
}

function aggregateAcledToZones(events) {
  // Group events by region and return risk objects
  const regions = {};
  events.forEach(e => {
    if (!regions[e.region]) regions[e.region] = { count: 0, region: e.region };
    regions[e.region].count++;
  });

  return Object.values(regions).map(r => ({
    id:          `ACLED-${r.region}`,
    region:      r.region,
    level:       r.count > 10 ? 'HIGH' : r.count > 3 ? 'MEDIUM' : 'LOW',
    type:        'conflict',
    description: `${r.count} conflict events recorded in last 30 days (ACLED)`,
    warRiskPremiumPct: r.count > 10 ? 2.0 : r.count > 3 ? 0.8 : 0.2,
    updatedAt:   new Date().toISOString(),
  }));
}

function mapGardSeverity(sev) {
  if (sev >= 3) return 'HIGH';
  if (sev >= 2) return 'MEDIUM';
  return 'LOW';
}

module.exports = { getRisks, getPortCongestion, getRouteRiskScore };
