/**
 * Voyage Calculator Service
 * ─────────────────────────────────────────────────────────────
 * All calculation logic lives here.
 * Distances use a static lookup for now — replace with
 * a sea-distance API or the searoute npm package.
 */
const { getFuelPrices } = require('./fuelService');

// ── Port Distance Table (nm) — Replace with searoute API ──────
// npm install searoute  →  https://github.com/gentilhomme/searoute-js
const DISTANCES = {
  'Paranagua-Rotterdam':     11240,
  'Paranagua-Qingdao':       12400,
  'Tubarao-Qingdao':         11800,
  'Tubarao-Rotterdam':        5800,
  'Port Hedland-Qingdao':     4200,
  'Port Hedland-Rotterdam':  11900,
  'Newcastle-India':          5800,
  'Richards Bay-Japan':       8100,
  'NOLA-Rotterdam':           5200,
  'Riga-Lagos':               5900,
};

// ── Port Cost Table (USD) — Replace with Port Authority API ───
const PORT_COSTS = {
  Rotterdam:     45000,
  Singapore:     35000,
  Qingdao:       40000,
  'Port Hedland':38000,
  Tubarao:       42000,
  Houston:       50000,
  Paranagua:     38000,
  Newcastle:     32000,
  'Richards Bay':30000,
  NOLA:          48000,
};

// ── Canal Fees (USD) — update from canal authority sources ────
const CANAL_FEES = {
  suez:   { Capesize: 420000, Panamax: 280000, Supramax: 180000, Ultramax: 190000, Handysize: 120000, Handymax: 140000 },
  panama: { Capesize: 0,      Panamax: 350000, Supramax: 220000, Ultramax: 230000, Handysize: 150000, Handymax: 180000 },
};

// ── Bunker Consumption (MT/day at eco-speed) ─────────────────
const CONSUMPTION = {
  Capesize:  { eco: 52, normal: 62 },
  Panamax:   { eco: 28, normal: 34 },
  Supramax:  { eco: 24, normal: 30 },
  Ultramax:  { eco: 25, normal: 31 },
  Handymax:  { eco: 20, normal: 25 },
  Handysize: { eco: 16, normal: 20 },
};

async function calculateVoyage(params) {
  const {
    vesselType  = 'Supramax',
    dwt         = 58000,
    loadPort,
    dischPort,
    cargoQty    = 55000,
    freightRate = 28.50,
    speedKnots  = 12.5,
    fuelGrade   = 'VLSFO',
    route       = 'auto',
  } = params;

  // ── Distance ──────────────────────────────────────────────
  const routeKey     = `${loadPort}-${dischPort}`;
  const distanceNm   = DISTANCES[routeKey] || estimateDistance(loadPort, dischPort);

  // ── Route & Canal ─────────────────────────────────────────
  const canal        = resolveCanal(route, loadPort, dischPort);
  const canalFee     = canal ? (CANAL_FEES[canal]?.[vesselType] || 0) : 0;

  // ── Sailing Time ──────────────────────────────────────────
  const sailingDays  = distanceNm / (speedKnots * 24);
  const portDays     = 4; // simplified — load 2d + disch 2d
  const totalDays    = sailingDays + portDays + (canal ? 1.5 : 0);

  // ── Bunker ────────────────────────────────────────────────
  const cons         = CONSUMPTION[vesselType] || CONSUMPTION.Supramax;
  const consPerDay   = speedKnots > 13 ? cons.normal : cons.eco;
  const bunkerMt     = sailingDays * consPerDay;

  // Get live fuel price (falls back to mock)
  const prices       = await getFuelPrices({ grade: fuelGrade });
  const fuelPriceUsd = prices[0]?.priceUsd || 582;
  const bunkerCost   = bunkerMt * fuelPriceUsd;

  // ── Port Costs ────────────────────────────────────────────
  const portCost     = (PORT_COSTS[loadPort] || 40000) + (PORT_COSTS[dischPort] || 40000);

  // ── Insurance / P&I ───────────────────────────────────────
  const insurancePct = 0.005; // 0.5% of cargo value — rough estimate
  const cargoValue   = cargoQty * freightRate * 20; // rough
  const insurance    = cargoValue * insurancePct;

  // ── Totals ────────────────────────────────────────────────
  const totalCost    = bunkerCost + portCost + canalFee + insurance;
  const revenue      = cargoQty * freightRate;
  const grossProfit  = revenue - totalCost;
  const tce          = grossProfit / totalDays;
  const costPerMt    = totalCost / cargoQty;
  const breakevenRate= totalCost / cargoQty;

  return {
    input: { vesselType, dwt, loadPort, dischPort, cargoQty, freightRate, speedKnots, fuelGrade, route },
    route: {
      distanceNm:    Math.round(distanceNm),
      canal:         canal || 'none',
      sailingDays:   parseFloat(sailingDays.toFixed(1)),
      portDays,
      totalDays:     parseFloat(totalDays.toFixed(1)),
    },
    bunker: {
      consumptionMt: Math.round(bunkerMt),
      pricePerMt:    fuelPriceUsd,
      totalCost:     Math.round(bunkerCost),
      grade:         fuelGrade,
    },
    costs: {
      bunker:    Math.round(bunkerCost),
      port:      Math.round(portCost),
      canal:     Math.round(canalFee),
      insurance: Math.round(insurance),
      total:     Math.round(totalCost),
    },
    results: {
      revenue:       Math.round(revenue),
      grossProfit:   Math.round(grossProfit),
      tcePerDay:     Math.round(tce),
      costPerMt:     parseFloat(costPerMt.toFixed(2)),
      breakevenRate: parseFloat(breakevenRate.toFixed(2)),
    },
    timestamp: new Date().toISOString(),
  };
}

// ── Helpers ───────────────────────────────────────────────────
function resolveCanal(route, load, disch) {
  if (route === 'suez')  return 'suez';
  if (route === 'panama') return 'panama';
  if (route === 'cape')   return null;
  // Auto-detect based on port geography (simplified)
  const pacToAtl = /(Newcastle|Port Hedland|Qingdao).*Rotterdam|Rotterdam.*(Newcastle|Qingdao)/i.test(`${load}-${disch}`);
  if (pacToAtl) return 'suez'; // default Asia-Europe via Suez
  return null;
}

function estimateDistance(load, disch) {
  // Fallback rough estimate — replace with searoute library
  console.warn(`[voyage] No distance found for ${load}-${disch}, using default 8000nm`);
  return 8000;
}

module.exports = { calculateVoyage };
