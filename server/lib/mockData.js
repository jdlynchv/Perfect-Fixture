/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MOCK DATA — The Perfect Fixture
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every export in this file is a MOCK FALLBACK used when the corresponding
 * real API key is not configured.
 *
 * HOW TO REPLACE:
 *  1. Add your API key to .env
 *  2. Open the matching service file (e.g. server/services/fuelService.js)
 *  3. The service already checks config.isConfigured('apiName') and will
 *     automatically use the real API instead of these mocks.
 *
 * REPLACEMENT MAP:
 *  MOCK_VESSELS       → MarineTraffic / AISHub / VesselFinder API
 *  MOCK_FUEL_PRICES   → Ship & Bunker API / EIA API / OilPrice API
 *  MOCK_INDICES       → Baltic Exchange API / Freightos FBX API
 *  MOCK_CARGOES       → Your own DB / cargo marketplace feed
 *  MOCK_FIXTURES      → Your own DB
 *  MOCK_RISKS         → GardAlert / ACLED API
 *  MOCK_PORTS         → PortWatch IMF API / Sea-Intelligence
 *  MOCK_FORECAST      → Internal model / 3rd-party forecast API
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── VESSELS (AIS) ─────────────────────────────────────────────────────────────
// Replace with: MarineTraffic /getVesselPositionsV2 or AISHub /api endpoint
const MOCK_VESSELS = [
  {
    mmsi:       '636092538',
    imo:        '9780033',
    name:       'MV AURORA STAR',
    type:       'Ultramax',
    dwt:        63500,
    flag:       'MH',
    lat:        45.2,
    lng:        -28.4,
    speed:      12.4,
    heading:    48,
    status:     'laden',        // 'laden' | 'ballast' | 'port'
    nextPort:   'Rotterdam',
    etaUtc:     '2024-01-20T08:00:00Z',
    lastCargo:  'Grain',
    owner:      'Star Bulk Carriers',
    operator:   'Star Bulk Carriers',
    openDate:   '2024-01-21',
    openPort:   'Rotterdam',
    draught:    11.2,
  },
  {
    mmsi:       '477219700',
    imo:        '9388715',
    name:       'MV PACIFIC DAWN',
    type:       'Panamax',
    dwt:        75200,
    flag:       'HK',
    lat:        1.24,
    lng:        103.8,
    speed:      0,
    heading:    0,
    status:     'port',
    nextPort:   'Singapore',
    etaUtc:     null,
    lastCargo:  'Coal',
    owner:      'Pacific Basin',
    operator:   'Pacific Basin',
    openDate:   '2024-01-25',
    openPort:   'Singapore',
    draught:    13.5,
  },
  {
    mmsi:       '538007562',
    imo:        '9644555',
    name:       'MV CAPE MERIDIAN',
    type:       'Capesize',
    dwt:        180000,
    flag:       'MH',
    lat:        -14.8,
    lng:        72.3,
    speed:      14.2,
    heading:    88,
    status:     'laden',
    nextPort:   'Qingdao',
    etaUtc:     '2024-01-28T14:00:00Z',
    lastCargo:  'Iron Ore',
    owner:      'Oldendorff Carriers',
    operator:   'Oldendorff Carriers',
    openDate:   '2024-02-01',
    openPort:   'Qingdao',
    draught:    17.8,
  },
  {
    mmsi:       '241486000',
    imo:        '9320183',
    name:       'MV EURO SPIRIT',
    type:       'Handysize',
    dwt:        37800,
    flag:       'GR',
    lat:        37.9,
    lng:        22.4,
    speed:      9.8,
    heading:    182,
    status:     'ballast',
    nextPort:   'Piraeus',
    etaUtc:     '2024-01-18T10:00:00Z',
    lastCargo:  null,
    owner:      'Costamare',
    operator:   'Costamare',
    openDate:   '2024-01-19',
    openPort:   'Piraeus',
    draught:    5.4,
  },
  {
    mmsi:       '311000232',
    imo:        '9502416',
    name:       'MV TITAN GLORY',
    type:       'Supramax',
    dwt:        58000,
    flag:       'BS',
    lat:        25.4,
    lng:        -88.2,
    speed:      11.1,
    heading:    270,
    status:     'laden',
    nextPort:   'Houston',
    etaUtc:     '2024-01-17T18:00:00Z',
    lastCargo:  'Soybean',
    owner:      'Diana Shipping',
    operator:   'Diana Shipping',
    openDate:   '2024-01-20',
    openPort:   'Houston',
    draught:    10.8,
  },
];

// ── FUEL PRICES ───────────────────────────────────────────────────────────────
// Replace with: Ship & Bunker API  GET https://shipandbunker.com/api/v1/prices
//           or: OilPrice API       GET https://api.oilpriceapi.com/v1/prices/latest
const MOCK_FUEL_PRICES = [
  { grade: 'VLSFO', port: 'Rotterdam',  portCode: 'RTM', priceUsd: 582, deltaDay: +4,  deltaPct: +0.69 },
  { grade: 'VLSFO', port: 'Singapore',  portCode: 'SIN', priceUsd: 579, deltaDay: +3,  deltaPct: +0.52 },
  { grade: 'VLSFO', port: 'Fujairah',   portCode: 'FUJ', priceUsd: 575, deltaDay: +2,  deltaPct: +0.35 },
  { grade: 'IFO380', port: 'Rotterdam', portCode: 'RTM', priceUsd: 468, deltaDay: -2,  deltaPct: -0.43 },
  { grade: 'IFO380', port: 'Singapore', portCode: 'SIN', priceUsd: 462, deltaDay: -3,  deltaPct: -0.64 },
  { grade: 'MGO',    port: 'Rotterdam', portCode: 'RTM', priceUsd: 741, deltaDay: +7,  deltaPct: +0.95 },
  { grade: 'MGO',    port: 'Singapore', portCode: 'SIN', priceUsd: 736, deltaDay: +6,  deltaPct: +0.82 },
  { grade: 'MGO',    port: 'Fujairah',  portCode: 'FUJ', priceUsd: 728, deltaDay: +5,  deltaPct: +0.69 },
  { grade: 'LNG',    port: 'Japan',     portCode: 'JPN', priceUsd: 11.4, deltaDay: +0.3, deltaPct: +2.70 },
];

// ── BALTIC INDICES ────────────────────────────────────────────────────────────
// Replace with: Baltic Exchange API  GET /api/v1/indices
//           or: Freightos FBX API
const MOCK_INDICES = [
  { code: 'BDI',  name: 'Baltic Dry Index',           value: 1847, change: +38,  changePct: +2.10 },
  { code: 'BSI',  name: 'Baltic Supramax Index',       value: 1394, change: +22,  changePct: +1.61 },
  { code: 'BPI',  name: 'Baltic Panamax Index',        value: 1622, change: -14,  changePct: -0.85 },
  { code: 'BHSI', name: 'Baltic Handysize Index',      value: 892,  change: +5,   changePct: +0.56 },
  { code: 'BCI',  name: 'Baltic Capesize Index',       value: 2341, change: +61,  changePct: +2.68 },
  { code: 'BCTI', name: 'Baltic Clean Tanker Index',   value: 672,  change: -28,  changePct: -4.00 },
];

// ── FREIGHT RATES (Regional) ──────────────────────────────────────────────────
// Replace with: Baltic Exchange route-specific rates
const MOCK_FREIGHT_RATES = [
  { route: 'Pacific RV',      segment: 'Panamax',   rateUsd: 28.40, change: +1.20 },
  { route: 'Transatlantic',   segment: 'Supramax',  rateUsd: 22.10, change: -0.40 },
  { route: 'Fronthaul',       segment: 'Supramax',  rateUsd: 34.60, change: +2.10 },
  { route: 'Indian Ocean RV', segment: 'Handysize', rateUsd: 19.80, change: -0.80 },
  { route: 'S. America',      segment: 'Panamax',   rateUsd: 31.20, change: +0.60 },
];

// ── CARGOES (Marketplace) ─────────────────────────────────────────────────────
// Replace with: Your own database / cargo posting system
const MOCK_CARGOES = [
  {
    id:           'CGO-2024-001',
    type:         'Iron Ore',
    quantity:     120000,
    unit:         'MT',
    loadPort:     'Port Hedland',
    loadPortCode: 'PHD',
    dischPort:    'Qingdao',
    dischPortCode:'QIN',
    laycanFrom:   '2024-01-15',
    laycanTo:     '2024-01-25',
    spec:         'Fe 62%, moisture <8%',
    charterer:    'Cargill',
    status:       'open',
    targetRate:   24.50,
    currency:     'USD',
  },
  {
    id:           'CGO-2024-002',
    type:         'Grain (Soybean)',
    quantity:     55000,
    unit:         'MT',
    loadPort:     'Paranagua',
    loadPortCode: 'PNG',
    dischPort:    'Rotterdam',
    dischPortCode:'RTM',
    laycanFrom:   '2024-01-10',
    laycanTo:     '2024-01-20',
    spec:         'NON-GMO, moisture <14%',
    charterer:    'ADM',
    status:       'open',
    targetRate:   28.00,
    currency:     'USD',
  },
  {
    id:           'CGO-2024-003',
    type:         'Coal (Steam)',
    quantity:     70000,
    unit:         'MT',
    loadPort:     'Newcastle',
    loadPortCode: 'NTL',
    dischPort:    'Mundra',
    dischPortCode:'MUN',
    laycanFrom:   '2024-01-20',
    laycanTo:     '2024-01-28',
    spec:         'CV 5,800 kcal/kg GAR',
    charterer:    'Glencore',
    status:       'open',
    targetRate:   18.20,
    currency:     'USD',
  },
  {
    id:           'CGO-2024-004',
    type:         'Fertilizers',
    quantity:     25000,
    unit:         'MT',
    loadPort:     'Riga',
    loadPortCode: 'RIX',
    dischPort:    'Lagos',
    dischPortCode:'LOS',
    laycanFrom:   '2024-02-01',
    laycanTo:     '2024-02-10',
    spec:         'Bulk, bagged, no dangerous goods',
    charterer:    'Yara',
    status:       'open',
    targetRate:   42.00,
    currency:     'USD',
  },
];

// ── FIXTURES ──────────────────────────────────────────────────────────────────
// Replace with: Your own database
const MOCK_FIXTURES = [
  {
    id:          'FX-2024-001',
    cargoId:     'CGO-2024-001',
    cargo:       'Iron Ore',
    quantity:    120000,
    loadPort:    'Tubarao',
    dischPort:   'Qingdao',
    vesselName:  'MV CAPE MERIDIAN',
    charterer:   'Cargill',
    owner:       'Star Bulk',
    status:      'negotiating',  // 'proposed' | 'negotiating' | 'closed' | 'failed'
    createdAt:   '2024-01-08T09:00:00Z',
    updatedAt:   '2024-01-08T14:22:00Z',
    terms: [
      { clause: 'Freight Rate',  partyA: '$24.50/MT',       partyB: '$23.00/MT',       status: 'countered' },
      { clause: 'Laycan',        partyA: '15-20 Jan',       partyB: '15-20 Jan',       status: 'agreed'    },
      { clause: 'Demurrage',     partyA: '$15,000/day',     partyB: '$14,000/day',     status: 'countered' },
      { clause: 'Dispatch',      partyA: 'Half Demurrage',  partyB: 'Half Demurrage',  status: 'agreed'    },
      { clause: 'Load Rate',     partyA: '8,000 MT/day',    partyB: '8,000 MT/day',    status: 'agreed'    },
      { clause: 'Disch Rate',    partyA: '6,000 MT/day',    partyB: '5,500 MT/day',    status: 'countered' },
      { clause: 'War Risk',      partyA: 'Owner Account',   partyB: 'Owner Account',   status: 'agreed'    },
      { clause: 'Arbitration',   partyA: 'London',          partyB: 'London',          status: 'agreed'    },
    ],
  },
  {
    id:          'FX-2024-002',
    cargoId:     'CGO-2024-002',
    cargo:       'Grain',
    quantity:    55000,
    loadPort:    'NOLA',
    dischPort:   'Rotterdam',
    vesselName:  'MV PACIFIC DAWN',
    charterer:   'ADM',
    owner:       'Pacific Basin',
    status:      'closed',
    createdAt:   '2024-01-05T10:00:00Z',
    updatedAt:   '2024-01-07T16:00:00Z',
    terms: [],
  },
  {
    id:          'FX-2024-003',
    cargoId:     'CGO-2024-003',
    cargo:       'Coal',
    quantity:    70000,
    loadPort:    'Richards Bay',
    dischPort:   'Japan',
    vesselName:  null,
    charterer:   'Glencore',
    owner:       'Oldendorff',
    status:      'proposed',
    createdAt:   '2024-01-09T08:00:00Z',
    updatedAt:   '2024-01-09T08:00:00Z',
    terms: [],
  },
];

// ── RISK ZONES ────────────────────────────────────────────────────────────────
// Replace with: GardAlert API / ACLED API / Maritime Domain Awareness feeds
const MOCK_RISKS = [
  {
    id:          'RISK-001',
    region:      'Red Sea / Gulf of Aden',
    level:       'HIGH',     // 'HIGH' | 'MEDIUM' | 'LOW'
    type:        'conflict', // 'conflict' | 'piracy' | 'weather' | 'congestion' | 'political'
    description: 'Active Houthi missile and drone attacks on commercial shipping — UKMTO advisory in effect',
    warRiskPremiumPct: 2.5,
    updatedAt:   '2024-01-09T06:00:00Z',
    bbox:        { minLat: 10, maxLat: 22, minLng: 40, maxLng: 55 },
  },
  {
    id:          'RISK-002',
    region:      'Strait of Hormuz',
    level:       'HIGH',
    type:        'conflict',
    description: 'Elevated geopolitical tension — Iranian naval activity elevated, armed escort recommended',
    warRiskPremiumPct: 1.8,
    updatedAt:   '2024-01-08T14:00:00Z',
    bbox:        { minLat: 24, maxLat: 27, minLng: 56, maxLng: 60 },
  },
  {
    id:          'RISK-003',
    region:      'West Africa / Gulf of Guinea',
    level:       'MEDIUM',
    type:        'piracy',
    description: 'Piracy incidents reported Q4 2023 — armed security teams recommended offshore Nigeria/Benin',
    warRiskPremiumPct: 0.8,
    updatedAt:   '2024-01-07T09:00:00Z',
    bbox:        { minLat: -2, maxLat: 6, minLng: -5, maxLng: 8 },
  },
  {
    id:          'RISK-004',
    region:      'Suez Canal',
    level:       'MEDIUM',
    type:        'congestion',
    description: 'Heavy congestion due to Red Sea diversions — northbound delays up to 48hrs',
    warRiskPremiumPct: 0.3,
    updatedAt:   '2024-01-09T07:30:00Z',
    bbox:        { minLat: 29, maxLat: 32, minLng: 32, maxLng: 33 },
  },
  {
    id:          'RISK-005',
    region:      'Panama Canal',
    level:       'LOW',
    type:        'congestion',
    description: 'Water level restrictions — max draft 13.1m, 72hr average transit wait',
    warRiskPremiumPct: 0.1,
    updatedAt:   '2024-01-09T05:00:00Z',
    bbox:        { minLat: 8, maxLat: 10, minLng: -80, maxLng: -77 },
  },
  {
    id:          'RISK-006',
    region:      'North Atlantic (Winter)',
    level:       'LOW',
    type:        'weather',
    description: 'Seasonal heavy weather routing advised — Beaufort 7+ conditions possible Jan/Feb',
    warRiskPremiumPct: 0.2,
    updatedAt:   '2024-01-09T00:00:00Z',
    bbox:        { minLat: 40, maxLat: 60, minLng: -60, maxLng: -10 },
  },
];

// ── PORT CONGESTION ───────────────────────────────────────────────────────────
// Replace with: PortWatch IMF API  GET https://portwatch.imf.org/api/...
const MOCK_PORTS = [
  { name: 'Rotterdam',    code: 'RTM', country: 'NL', congestionDays: 1.2, waitBerth: 0.8,  status: 'normal'  },
  { name: 'Singapore',    code: 'SIN', country: 'SG', congestionDays: 0.5, waitBerth: 0.4,  status: 'normal'  },
  { name: 'Qingdao',      code: 'TAO', country: 'CN', congestionDays: 3.1, waitBerth: 2.4,  status: 'busy'    },
  { name: 'Port Hedland', code: 'PHD', country: 'AU', congestionDays: 0.8, waitBerth: 0.6,  status: 'normal'  },
  { name: 'Tubarao',      code: 'TBR', country: 'BR', congestionDays: 1.5, waitBerth: 1.1,  status: 'normal'  },
  { name: 'Houston',      code: 'HOU', country: 'US', congestionDays: 2.2, waitBerth: 1.8,  status: 'busy'    },
  { name: 'Suez (Canal)', code: 'SUZ', country: 'EG', congestionDays: 4.8, waitBerth: 48.0, status: 'delayed' },
];

// ── BDI FORECAST (mock 30-day series) ────────────────────────────────────────
// Replace with: Internal ML model / 3rd-party shipping analytics API
const MOCK_BDI_FORECAST = (() => {
  const historical = [1640,1680,1720,1695,1750,1780,1810,1795,1820,1840,1835,1847];
  const forecast   = [1870,1910,1940,1980,2020,2060,2080,2100,2140,2180,2200,2230];
  const upper      = forecast.map(v => Math.round(v * 1.08));
  const lower      = forecast.map(v => Math.round(v * 0.93));
  return { historical, forecast, upper, lower, aiConfidence: 74, signal: 'BULLISH' };
})();

// ── VESSEL COUNT ──────────────────────────────────────────────────────────────
// Replace with: MarineTraffic /getVesselPositionsV2 count or AISHub statistics
const MOCK_VESSEL_COUNT = {
  total:   12847,
  laden:   8214,
  ballast: 3102,
  inPort:  1531,
};

module.exports = {
  MOCK_VESSELS,
  MOCK_FUEL_PRICES,
  MOCK_INDICES,
  MOCK_FREIGHT_RATES,
  MOCK_CARGOES,
  MOCK_FIXTURES,
  MOCK_RISKS,
  MOCK_PORTS,
  MOCK_BDI_FORECAST,
  MOCK_VESSEL_COUNT,
};
