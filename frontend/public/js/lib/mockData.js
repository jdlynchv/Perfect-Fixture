/**
 * Frontend Mock Data
 * ─────────────────────────────────────────────────────────────
 * Used as FALLBACK when the backend server is unreachable.
 * Keep in sync with server/lib/mockData.js
 *
 * When your real APIs are connected, this file becomes unused
 * because API calls will succeed and return real data.
 */

window.MOCK_DATA = {

  vessels: [
    { mmsi:'636092538', name:'MV AURORA STAR',  type:'Ultramax', dwt:63500,  lat:45.2,  lng:-28.4, speed:12.4, status:'laden',   nextPort:'Rotterdam',    etaUtc:'2024-01-20T08:00:00Z', lastCargo:'Grain',    owner:'Star Bulk',       openDate:'2024-01-21', openPort:'Rotterdam' },
    { mmsi:'477219700', name:'MV PACIFIC DAWN', type:'Panamax',  dwt:75200,  lat:1.24,  lng:103.8, speed:0,    status:'port',    nextPort:'Singapore',    etaUtc:null,                   lastCargo:'Coal',     owner:'Pacific Basin',   openDate:'2024-01-25', openPort:'Singapore' },
    { mmsi:'538007562', name:'MV CAPE MERIDIAN',type:'Capesize', dwt:180000, lat:-14.8, lng:72.3,  speed:14.2, status:'laden',   nextPort:'Qingdao',      etaUtc:'2024-01-28T14:00:00Z', lastCargo:'Iron Ore', owner:'Oldendorff',      openDate:'2024-02-01', openPort:'Qingdao'   },
    { mmsi:'241486000', name:'MV EURO SPIRIT',  type:'Handysize',dwt:37800,  lat:37.9,  lng:22.4,  speed:9.8,  status:'ballast', nextPort:'Piraeus',      etaUtc:'2024-01-18T10:00:00Z', lastCargo:null,       owner:'Costamare',       openDate:'2024-01-19', openPort:'Piraeus'   },
    { mmsi:'311000232', name:'MV TITAN GLORY',  type:'Supramax', dwt:58000,  lat:25.4,  lng:-88.2, speed:11.1, status:'laden',   nextPort:'Houston',      etaUtc:'2024-01-17T18:00:00Z', lastCargo:'Soybean',  owner:'Diana Shipping',  openDate:'2024-01-20', openPort:'Houston'   },
  ],

  vesselCount: { total:12847, laden:8214, ballast:3102, inPort:1531 },

  fuel: [
    { grade:'VLSFO',  port:'Rotterdam', portCode:'RTM', priceUsd:582,  deltaDay:+4,  deltaPct:+0.69 },
    { grade:'VLSFO',  port:'Singapore', portCode:'SIN', priceUsd:579,  deltaDay:+3,  deltaPct:+0.52 },
    { grade:'IFO380', port:'Rotterdam', portCode:'RTM', priceUsd:468,  deltaDay:-2,  deltaPct:-0.43 },
    { grade:'IFO380', port:'Singapore', portCode:'SIN', priceUsd:462,  deltaDay:-3,  deltaPct:-0.64 },
    { grade:'MGO',    port:'Rotterdam', portCode:'RTM', priceUsd:741,  deltaDay:+7,  deltaPct:+0.95 },
    { grade:'MGO',    port:'Fujairah',  portCode:'FUJ', priceUsd:728,  deltaDay:+5,  deltaPct:+0.69 },
    { grade:'LNG',    port:'Japan',     portCode:'JPN', priceUsd:11.4, deltaDay:+0.3,deltaPct:+2.70 },
  ],

  indices: [
    { code:'BDI',  name:'Baltic Dry Index',         value:1847, change:+38,  changePct:+2.10 },
    { code:'BSI',  name:'Baltic Supramax Index',     value:1394, change:+22,  changePct:+1.61 },
    { code:'BPI',  name:'Baltic Panamax Index',      value:1622, change:-14,  changePct:-0.85 },
    { code:'BHSI', name:'Baltic Handysize Index',    value:892,  change:+5,   changePct:+0.56 },
    { code:'BCI',  name:'Baltic Capesize Index',     value:2341, change:+61,  changePct:+2.68 },
    { code:'BCTI', name:'Baltic Clean Tanker Index', value:672,  change:-28,  changePct:-4.00 },
  ],

  rates: [
    { route:'Pacific RV',      segment:'Panamax',   rateUsd:28.40, change:+1.20 },
    { route:'Transatlantic',   segment:'Supramax',  rateUsd:22.10, change:-0.40 },
    { route:'Fronthaul',       segment:'Supramax',  rateUsd:34.60, change:+2.10 },
    { route:'Indian Ocean RV', segment:'Handysize', rateUsd:19.80, change:-0.80 },
    { route:'S. America',      segment:'Panamax',   rateUsd:31.20, change:+0.60 },
  ],

  forecast: {
    historical: [1640,1680,1720,1695,1750,1780,1810,1795,1820,1840,1835,1847],
    forecast:   [1870,1910,1940,1980,2020,2060,2080,2100,2140,2180,2200,2230],
    upper:      [2019,2063,2095,2138,2182,2225,2246,2268,2311,2354,2376,2408],
    lower:      [1739,1777,1804,1841,1879,1916,1934,1953,1990,2027,2046,2074],
    aiConfidence: 74,
    signal:     'BULLISH',
  },

  cargoes: [
    { id:'CGO-2024-001', type:'Iron Ore',        quantity:120000, unit:'MT', loadPort:'Port Hedland', dischPort:'Qingdao',   laycanFrom:'2024-01-15', laycanTo:'2024-01-25', spec:'Fe 62%',              charterer:'Cargill', status:'open', targetRate:24.50 },
    { id:'CGO-2024-002', type:'Grain (Soybean)', quantity:55000,  unit:'MT', loadPort:'Paranagua',    dischPort:'Rotterdam', laycanFrom:'2024-01-10', laycanTo:'2024-01-20', spec:'NON-GMO',              charterer:'ADM',     status:'open', targetRate:28.00 },
    { id:'CGO-2024-003', type:'Coal (Steam)',     quantity:70000,  unit:'MT', loadPort:'Newcastle',    dischPort:'Mundra',    laycanFrom:'2024-01-20', laycanTo:'2024-01-28', spec:'CV 5,800 kcal',        charterer:'Glencore',status:'open', targetRate:18.20 },
    { id:'CGO-2024-004', type:'Fertilizers',      quantity:25000,  unit:'MT', loadPort:'Riga',         dischPort:'Lagos',     laycanFrom:'2024-02-01', laycanTo:'2024-02-10', spec:'Bulk, bagged',         charterer:'Yara',    status:'open', targetRate:42.00 },
  ],

  fixtures: [
    { id:'FX-2024-001', cargo:'Iron Ore',  quantity:120000, loadPort:'Tubarao',       dischPort:'Qingdao',   vesselName:'MV CAPE MERIDIAN', charterer:'Cargill',  owner:'Star Bulk',    status:'negotiating',
      terms:[
        { clause:'Freight Rate', partyA:'$24.50/MT',      partyB:'$23.00/MT',      status:'countered' },
        { clause:'Laycan',       partyA:'15-20 Jan',      partyB:'15-20 Jan',      status:'agreed'    },
        { clause:'Demurrage',    partyA:'$15,000/day',    partyB:'$14,000/day',    status:'countered' },
        { clause:'Dispatch',     partyA:'Half Demurrage', partyB:'Half Demurrage', status:'agreed'    },
        { clause:'Load Rate',    partyA:'8,000 MT/day',   partyB:'8,000 MT/day',   status:'agreed'    },
        { clause:'Disch Rate',   partyA:'6,000 MT/day',   partyB:'5,500 MT/day',   status:'countered' },
        { clause:'War Risk',     partyA:'Owner Account',  partyB:'Owner Account',  status:'agreed'    },
        { clause:'Arbitration',  partyA:'London',         partyB:'London',         status:'agreed'    },
      ]
    },
    { id:'FX-2024-002', cargo:'Grain', quantity:55000, loadPort:'NOLA', dischPort:'Rotterdam', vesselName:'MV PACIFIC DAWN', charterer:'ADM',     owner:'Pacific Basin', status:'closed',      terms:[] },
    { id:'FX-2024-003', cargo:'Coal',  quantity:70000, loadPort:'Richards Bay', dischPort:'Japan', vesselName:null,            charterer:'Glencore',owner:'Oldendorff',   status:'proposed',    terms:[] },
  ],

  risks: [
    { id:'RISK-001', region:'Red Sea / Gulf of Aden',       level:'HIGH',   type:'conflict',   description:'Active Houthi missile/drone attacks — UKMTO advisory in effect',       warRiskPremiumPct:2.5 },
    { id:'RISK-002', region:'Strait of Hormuz',             level:'HIGH',   type:'conflict',   description:'Elevated geopolitical tension — armed escort recommended',               warRiskPremiumPct:1.8 },
    { id:'RISK-003', region:'West Africa / Gulf of Guinea', level:'MEDIUM', type:'piracy',     description:'Piracy incidents Q4 — armed security offshore Nigeria/Benin',            warRiskPremiumPct:0.8 },
    { id:'RISK-004', region:'Suez Canal',                   level:'MEDIUM', type:'congestion', description:'Heavy congestion due to Red Sea diversions — northbound delays ~48hrs',  warRiskPremiumPct:0.3 },
    { id:'RISK-005', region:'Panama Canal',                 level:'LOW',    type:'congestion', description:'Water level restrictions — max draft 13.1m, ~72hr transit wait',         warRiskPremiumPct:0.1 },
    { id:'RISK-006', region:'North Atlantic (Winter)',       level:'LOW',    type:'weather',    description:'Seasonal heavy weather routing advised — Beaufort 7+ possible Jan/Feb',  warRiskPremiumPct:0.2 },
  ],

  ports: [
    { name:'Rotterdam',    code:'RTM', congestionDays:1.2, waitBerth:0.8,  status:'normal'  },
    { name:'Singapore',    code:'SIN', congestionDays:0.5, waitBerth:0.4,  status:'normal'  },
    { name:'Qingdao',      code:'TAO', congestionDays:3.1, waitBerth:2.4,  status:'busy'    },
    { name:'Port Hedland', code:'PHD', congestionDays:0.8, waitBerth:0.6,  status:'normal'  },
    { name:'Suez (Canal)', code:'SUZ', congestionDays:4.8, waitBerth:48.0, status:'delayed' },
  ],

  // KPIs derived from the above (shown on dashboard)
  kpis: {
    estimatedTce:   18240,
    totalVoyageCost: 892000,
    activeFixtures: 23,
    bdi:            1847,
    riskLevel:      'MODERATE',
  },

  // Ticker items
  ticker: [
    { name:'BDI',      value:'1,847',  change:'+38',    up:true  },
    { name:'VLSFO-RTM',value:'$582/MT',change:'+4',     up:true  },
    { name:'IFO380-SIN',value:'$462/MT',change:'-3',    up:false },
    { name:'BSI',      value:'1,394',  change:'+22',    up:true  },
    { name:'BPI',      value:'1,622',  change:'-14',    up:false },
    { name:'MGO-FUJ',  value:'$728/MT',change:'+5',     up:true  },
    { name:'BCI',      value:'2,341',  change:'+61',    up:true  },
    { name:'BHSI',     value:'892',    change:'+5',     up:true  },
    { name:'WTI',      value:'$72.4',  change:'-0.8',   up:false },
    { name:'USD/EUR',  value:'1.0842', change:'+0.0012',up:true  },
  ],
};
