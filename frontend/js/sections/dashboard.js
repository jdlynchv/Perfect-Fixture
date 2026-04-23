/**
 * Dashboard Section
 * Fetches: KPIs, fuel prices, indices (BDI), alerts, forecast, fleet table
 */
async function renderDashboard(mc) {
  const { fmt, deltaClass, triggerReveal, miniChart, progRow } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div>
      <div class="section-title">Operations Dashboard</div>
      <div class="section-sub">Live market intelligence · Updated ${new Date().toLocaleTimeString()}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-secondary" onclick="Utils.notify('Dashboard exported to PDF')">↓ Export</button>
      <button class="btn-primary" onclick="showSection('voyage')">+ New Voyage</button>
    </div>
  </div>
  <div id="dash-kpis" class="kpi-grid reveal">${skeleton(5)}</div>
  <div class="dash-grid reveal" id="dash-panels"></div>
  <div class="dash-grid-2 reveal" id="dash-bottom"></div>
  <div class="card reveal" id="dash-table" style="margin-top:16px"></div>
  `;
  triggerReveal(mc);

  // ── Load data concurrently ──────────────────────────────────
  const [fuel, indices, vessels, risks] = await Promise.all([
    API.Fuel.prices().catch(() => null),
    API.Market.indices().catch(() => null),
    API.Vessels.list().catch(() => null),
    API.Risk.list().catch(() => null),
  ]);

  const fuelData    = fuel    || MOCK_DATA.fuel;
  const indicesData = indices || MOCK_DATA.indices;
  const vesselData  = vessels || MOCK_DATA.vessels;
  const riskData    = risks   || MOCK_DATA.risks;

  const bdi      = indicesData.find(i => i.code === 'BDI') || MOCK_DATA.indices[0];
  const vlsfoRTM = fuelData.find(f => f.grade === 'VLSFO' && f.portCode === 'RTM') || fuelData[0];

  // ── KPIs ────────────────────────────────────────────────────
  const kpiDefs = [
    { label:'Est. TCE',       value:`$${fmt.num(MOCK_DATA.kpis.estimatedTce)}/d`, delta:`+4.2%`,         up:true,  icon:'💹', color:'var(--accent-teal)'   },
    { label:'Voyage Cost',    value:fmt.usd(MOCK_DATA.kpis.totalVoyageCost),      delta:`-1.8%`,         up:false, icon:'⛽', color:'var(--accent-amber)'  },
    { label:'Active Fixtures',value:String(MOCK_DATA.kpis.activeFixtures),        delta:`+3`,            up:true,  icon:'📋', color:'var(--accent-blue)'   },
    { label:'BDI Index',      value:fmt.num(bdi.value),                           delta:fmt.pct(bdi.changePct), up:bdi.changePct>0, icon:'📊', color:'var(--accent-purple)' },
    { label:'Risk Level',     value:MOCK_DATA.kpis.riskLevel,                     delta:`Updated 2h ago`,up:null,  icon:'⚠️', color:'var(--accent-amber)'  },
  ];

  document.getElementById('dash-kpis').innerHTML = kpiDefs.map(k => `
  <div class="kpi-card" style="--accent-color:${k.color}">
    <div class="kpi-icon">${k.icon}</div>
    <div class="kpi-label">${k.label}</div>
    <div class="kpi-val">${k.value}</div>
    <div class="kpi-delta ${k.up===true?'delta-up':k.up===false?'delta-down':''}">${k.delta}</div>
  </div>`).join('');

  // ── Fuel + Alerts + Canal panels ────────────────────────────
  const fuelRows = fuelData.slice(0, 4).map(f => `
  <div class="fuel-row">
    <span class="fuel-name">${f.grade} <span style="color:var(--text-dim);font-size:10px">(${f.portCode})</span></span>
    <div style="display:flex;align-items:center;gap:10px">
      <span class="fuel-price">$${f.priceUsd}/MT</span>
      <span class="${f.deltaDay>0?'delta-up':'delta-down'}" style="font-size:11px">${f.deltaDay>0?'+':''}${f.deltaDay}</span>
    </div>
  </div>`).join('');

  const alertRows = riskData.filter(r => r.level !== 'LOW').slice(0, 4).map(r => {
    const color = r.level === 'HIGH' ? 'var(--accent-red)' : 'var(--accent-amber)';
    return `<div class="alert-item">
      <div class="alert-dot" style="background:${color}"></div>
      <div class="alert-msg"><strong>${r.region}:</strong> ${r.description.slice(0,60)}…</div>
      <div class="alert-time">${r.level}</div>
    </div>`;
  }).join('');

  document.getElementById('dash-panels').innerHTML = `
  <div class="card">
    <div class="card-label">⛽ Bunker Prices — Live</div>
    ${fuelRows}
    ${miniChart([42,55,48,62,58,70,65,72,68,75,70,78], 'var(--accent-teal)')}
    <div style="font-size:10px;color:var(--text-dim);text-align:center">VLSFO Rotterdam — 12 Week Trend</div>
  </div>
  <div class="card">
    <div class="card-label">🚨 Active Risk Alerts</div>
    ${alertRows || '<div style="color:var(--text-dim);font-size:12px;padding:10px 0">No active alerts</div>'}
  </div>
  <div class="card">
    <div class="card-label">🌊 Canal Intelligence</div>
    <div style="margin-bottom:12px">
      <div style="font-size:12px;font-weight:600;margin-bottom:8px">Suez Canal — Northbound</div>
      ${progRow('Utilization', 82, '82%', 'var(--accent-amber)')}
      <div class="fuel-row"><span class="fuel-name">Capesize Transit</span><span class="fuel-price">$420K</span></div>
      <div class="fuel-row"><span class="fuel-name">Current Delay</span><span style="color:var(--accent-amber);font-family:'JetBrains Mono',monospace">~48hrs</span></div>
    </div>
    <div>
      <div style="font-size:12px;font-weight:600;margin-bottom:8px">Panama Canal</div>
      ${progRow('Water Level', 61, '61%', 'var(--accent-amber)')}
      <div class="fuel-row"><span class="fuel-name">Max Draft</span><span class="fuel-price">13.1m</span></div>
      <div class="fuel-row"><span class="fuel-name">Wait Time</span><span style="color:var(--accent-amber);font-family:'JetBrains Mono',monospace">~72hrs</span></div>
    </div>
  </div>`;

  // ── BDI Forecast + Regional Rates ───────────────────────────
  const forecast = await API.Market.forecast().catch(() => null) || MOCK_DATA.forecast;
  const rates    = await API.Market.rates().catch(() => null)    || MOCK_DATA.rates;

  const sparkH = forecast.historical.map((v,i) => {
    const max = Math.max(...[...forecast.historical,...forecast.forecast]);
    const min = Math.min(...[...forecast.historical,...forecast.forecast]);
    const norm = (v - min) / (max - min);
    return `${(i / (forecast.historical.length-1)) * 240},${110 - norm * 90}`;
  }).join(' ');
  const sparkF = forecast.forecast.map((v,i) => {
    const max = Math.max(...[...forecast.historical,...forecast.forecast]);
    const min = Math.min(...[...forecast.historical,...forecast.forecast]);
    const norm = (v - min) / (max - min);
    return `${240 + (i / (forecast.forecast.length-1)) * 160},${110 - norm * 90}`;
  }).join(' ');

  document.getElementById('dash-bottom').innerHTML = `
  <div class="card">
    <div class="card-label">📈 BDI 30-Day AI Forecast</div>
    <div style="margin:8px 0 4px;display:flex;align-items:center;gap:10px">
      <span style="font-family:'JetBrains Mono',monospace;font-size:22px">${fmt.num(bdi.value)}</span>
      <span class="tag tag-teal">${forecast.signal}</span>
      <span style="font-size:11px;color:var(--text-dim)">AI Confidence: ${forecast.aiConfidence}%</span>
    </div>
    <div class="forecast-area">
      <svg class="forecast-svg" viewBox="0 0 400 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fgrd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00d4aa" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#00d4aa" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polyline points="${sparkH}" fill="none" stroke="#00d4aa" stroke-width="2"/>
        <polyline points="${sparkF}" fill="none" stroke="#00d4aa" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>
        <line x1="240" y1="10" x2="240" y2="110" stroke="var(--border-light)" stroke-width="1" stroke-dasharray="3,3"/>
        <text x="242" y="20" fill="var(--text-dim)" font-size="9" font-family="JetBrains Mono">TODAY</text>
        <text x="4"   y="115" fill="var(--text-dim)" font-size="8" font-family="JetBrains Mono">-30d</text>
        <text x="370" y="115" fill="var(--text-dim)" font-size="8" font-family="JetBrains Mono">+30d</text>
      </svg>
    </div>
  </div>
  <div class="card">
    <div class="card-label">🌍 Regional Freight Rates ($/MT)</div>
    ${rates.map(r => {
      const max = Math.max(...rates.map(x => x.rateUsd));
      return progRow(r.route, Math.round((r.rateUsd/max)*100), `$${r.rateUsd}`,
        r.change >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)');
    }).join('')}
  </div>`;

  // ── Fleet Table ─────────────────────────────────────────────
  document.getElementById('dash-table').innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
    <div class="card-label" style="margin:0">🚢 Active Fleet Overview</div>
    <button class="btn-secondary" style="font-size:11px;padding:5px 12px" onclick="showSection('vessels')">View Full Intel →</button>
  </div>
  <table class="data-table">
    <thead><tr><th>Vessel</th><th>Type</th><th>DWT</th><th>Position</th><th>Speed</th><th>Next Port / ETA</th><th>Status</th><th>Last Cargo</th></tr></thead>
    <tbody>
      ${vesselData.map(v => `<tr onclick="Utils.notify('Opening ${v.name} profile...')">
        <td class="vessel-name">${v.name}</td>
        <td>${v.type}</td>
        <td style="font-family:'JetBrains Mono',monospace">${fmt.num(v.dwt)}</td>
        <td>${v.lat.toFixed(1)}°, ${v.lng.toFixed(1)}°</td>
        <td style="font-family:'JetBrains Mono',monospace">${v.speed === 0 ? 'Anchored' : v.speed + ' kn'}</td>
        <td>${v.nextPort} ${v.etaUtc ? '('+fmt.date(v.etaUtc)+')' : ''}</td>
        <td>${Utils.statusBadge(v.status)}</td>
        <td>${v.lastCargo || '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

window.renderDashboard = renderDashboard;
