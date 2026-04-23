/**
 * Voyage Calculator Section
 * Calls POST /api/v1/voyage/calculate with form data
 * Falls back to client-side estimate if backend unavailable
 */
async function renderVoyage(mc) {
  const { triggerReveal } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div><div class="section-title">Voyage Calculator</div>
    <div class="section-sub">Real-time cost estimation · Route optimization · TCE analysis</div></div>
  </div>
  <div class="calc-grid reveal">
    <div class="card">
      <div class="card-label" style="margin-bottom:14px">📋 Voyage Parameters</div>
      <div class="form-grid">
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Vessel Type</label>
          <select class="form-select" id="v-type">
            <option>Handysize</option><option>Handymax</option>
            <option selected>Supramax</option><option>Ultramax</option>
            <option>Panamax</option><option>Capesize</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">DWT (MT)</label><input class="form-input" id="v-dwt" value="58000"></div>
        <div class="form-group"><label class="form-label">Speed (knots)</label><input class="form-input" id="v-speed" value="12.5"></div>
        <div class="form-group"><label class="form-label">Load Port</label><input class="form-input" id="v-load" value="Paranagua"></div>
        <div class="form-group"><label class="form-label">Discharge Port</label><input class="form-input" id="v-disch" value="Rotterdam"></div>
        <div class="form-group"><label class="form-label">Cargo Type</label>
          <select class="form-select" id="v-cargo">
            <option selected>Grain (Soybean)</option><option>Iron Ore</option>
            <option>Coal</option><option>Fertilizers</option><option>Steel</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Quantity (MT)</label><input class="form-input" id="v-qty" value="55000"></div>
        <div class="form-group"><label class="form-label">Freight Rate ($/MT)</label><input class="form-input" id="v-rate" value="28.50"></div>
        <div class="form-group"><label class="form-label">VLSFO Price ($/MT)</label><input class="form-input" id="v-fuel" value="582" placeholder="auto from API"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Route Preference</label>
          <select class="form-select" id="v-route">
            <option value="auto" selected>Auto-Optimize</option>
            <option value="suez">Via Suez Canal</option>
            <option value="cape">Via Cape of Good Hope</option>
            <option value="panama">Via Panama Canal</option>
          </select>
        </div>
      </div>
      <button class="calc-btn" id="calc-btn" onclick="runVoyageCalc()">⚡ CALCULATE VOYAGE</button>
    </div>
    <div class="result-panel" id="result-panel">
      <div class="card" style="color:var(--text-secondary);font-size:13px;padding:32px;text-align:center">
        Fill in voyage parameters and click Calculate to see the full cost breakdown.
      </div>
    </div>
  </div>`;
  triggerReveal(mc);
}

async function runVoyageCalc() {
  const { fmt, notify } = Utils;
  const btn = document.getElementById('calc-btn');
  btn.textContent = '⏳ Calculating...';
  btn.disabled = true;

  const params = {
    vesselType:  document.getElementById('v-type').value,
    dwt:         parseInt(document.getElementById('v-dwt').value.replace(/,/g,'')),
    speedKnots:  parseFloat(document.getElementById('v-speed').value),
    loadPort:    document.getElementById('v-load').value.trim(),
    dischPort:   document.getElementById('v-disch').value.trim(),
    cargoQty:    parseInt(document.getElementById('v-qty').value.replace(/,/g,'')),
    freightRate: parseFloat(document.getElementById('v-rate').value),
    fuelGrade:   'VLSFO',
    route:       document.getElementById('v-route').value,
  };

  // Optionally override fuel price if user typed one
  const userFuel = parseFloat(document.getElementById('v-fuel').value);
  if (!isNaN(userFuel)) params.fuelPriceOverride = userFuel;

  let result = await API.Voyage.calculate(params).catch(() => null);

  // Client-side fallback estimate
  if (!result) {
    result = clientSideVoyageEstimate(params);
    notify('Using client-side estimate (backend not running)', 'error');
  }

  renderVoyageResult(result, params);
  btn.textContent = '⚡ CALCULATE VOYAGE';
  btn.disabled = false;
}

function renderVoyageResult(r, params) {
  const { fmt } = Utils;
  const costs = r.costs || {};
  const res   = r.results || {};
  const route = r.route   || {};
  const bunk  = r.bunker  || {};

  const totalCost = costs.total || 0;
  const costItems = [
    { label:'Bunker (VLSFO)', val:costs.bunker   || 0, color:'var(--accent-teal)'   },
    { label:'Port Costs',     val:costs.port     || 0, color:'var(--accent-blue)'   },
    { label:'Canal Fees',     val:costs.canal    || 0, color:'var(--accent-amber)'  },
    { label:'Insurance/P&I', val:costs.insurance|| 0, color:'var(--accent-purple)' },
  ];

  document.getElementById('result-panel').innerHTML = `
  <div class="card">
    <div class="card-label">📍 Route: ${params.loadPort} → ${params.dischPort}
      <span class="tag tag-teal">${route.canal !== 'none' ? route.canal?.toUpperCase()+' Canal' : 'Cape Route'}</span>
    </div>
    <div style="background:var(--bg-base);border-radius:8px;height:130px;position:relative;overflow:hidden;margin:12px 0">
      <svg viewBox="0 0 500 130" style="width:100%;height:100%">
        <rect width="500" height="130" fill="#040c18"/>
        <ellipse cx="100" cy="70" rx="55" ry="40" fill="#0d2040" opacity="0.8"/>
        <ellipse cx="255" cy="58" rx="65" ry="45" fill="#0d2040" opacity="0.8"/>
        <ellipse cx="360" cy="75" rx="32" ry="22" fill="#0d2040" opacity="0.8"/>
        <path d="M95,92 Q150,120 200,128 Q255,136 295,128 Q335,118 385,72 Q402,56 422,50" fill="none" stroke="var(--accent-teal)" stroke-width="2" stroke-dasharray="5,3" opacity="0.85"/>
        <circle cx="95" cy="92" r="5" fill="var(--accent-teal)"/>
        <text x="98" y="112" fill="var(--accent-teal)" font-size="9" font-family="JetBrains Mono">${params.loadPort}</text>
        <circle cx="422" cy="50" r="5" fill="var(--accent-amber)"/>
        <text x="386" y="45" fill="var(--accent-amber)" font-size="9" font-family="JetBrains Mono">${params.dischPort}</text>
        <text x="250" y="128" font-size="11">🚢</text>
      </svg>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:11px">
      <div><span style="color:var(--text-dim)">Distance</span><div style="font-family:'JetBrains Mono',monospace;font-weight:500">${fmt.num(route.distanceNm || 0)} nm</div></div>
      <div><span style="color:var(--text-dim)">Sailing Days</span><div style="font-family:'JetBrains Mono',monospace;font-weight:500">${route.sailingDays || '—'} days</div></div>
      <div><span style="color:var(--text-dim)">Bunker Cons.</span><div style="font-family:'JetBrains Mono',monospace;font-weight:500">${fmt.num(bunk.consumptionMt || 0)} MT</div></div>
    </div>
  </div>
  <div class="result-kpi-grid">
    <div class="result-kpi" style="border-color:rgba(0,212,170,0.3)">
      <div class="result-kpi-label">TCE ($/day)</div>
      <div class="result-kpi-val" style="color:${(res.tcePerDay||0)>0?'var(--accent-teal)':'var(--accent-red)'}">$${fmt.num(res.tcePerDay||0)}</div>
    </div>
    <div class="result-kpi"><div class="result-kpi-label">Total Cost</div><div class="result-kpi-val">${fmt.usd(totalCost)}</div></div>
    <div class="result-kpi"><div class="result-kpi-label">Cost per MT</div><div class="result-kpi-val">$${res.costPerMt||'—'}</div></div>
    <div class="result-kpi"><div class="result-kpi-label">Freight Rev.</div><div class="result-kpi-val">${fmt.usd(res.revenue||0)}</div></div>
    <div class="result-kpi"><div class="result-kpi-label">Breakeven</div><div class="result-kpi-val">$${res.breakevenRate||'—'}/MT</div></div>
    <div class="result-kpi" style="border-color:${(res.grossProfit||0)>0?'rgba(34,197,94,0.3)':'rgba(255,71,87,0.3)'}">
      <div class="result-kpi-label">Net P&L</div>
      <div class="result-kpi-val" style="color:${(res.grossProfit||0)>0?'var(--green)':'var(--accent-red)'}">${(res.grossProfit||0)>=0?'+':''}${fmt.usd(res.grossProfit||0)}</div>
    </div>
  </div>
  <div class="card">
    <div class="card-label" style="margin-bottom:12px">💰 Cost Breakdown</div>
    ${costItems.map(c => `
    <div class="cost-row">
      <span class="cost-label">${c.label}</span>
      <div class="cost-bar-wrap"><div class="cost-bar" style="width:${totalCost?Math.round((c.val/totalCost)*100):0}%;background:${c.color}"></div></div>
      <span class="cost-val">${fmt.usd(c.val)}</span>
    </div>`).join('')}
  </div>`;
}

// ── Client-side fallback estimate ─────────────────────────────
function clientSideVoyageEstimate(p) {
  const DIST = { 'Paranagua-Rotterdam':11240, 'Tubarao-Qingdao':11800 };
  const CONS = { Capesize:52, Panamax:28, Supramax:24, Ultramax:25, Handymax:20, Handysize:16 };
  const dist = DIST[`${p.loadPort}-${p.dischPort}`] || 8000;
  const sail = dist / (p.speedKnots * 24);
  const cons = (CONS[p.vesselType] || 24) * sail;
  const bunkCost = cons * (p.fuelPriceOverride || 582);
  const portCost = 80000;
  const total    = bunkCost + portCost;
  const revenue  = p.cargoQty * p.freightRate;
  return {
    route:   { distanceNm: dist, sailingDays: +sail.toFixed(1), canal: 'none', totalDays: +(sail+4).toFixed(1) },
    bunker:  { consumptionMt: Math.round(cons), pricePerMt: p.fuelPriceOverride||582, totalCost: Math.round(bunkCost) },
    costs:   { bunker: Math.round(bunkCost), port: portCost, canal: 0, insurance: Math.round(total*0.05), total: Math.round(total*1.05) },
    results: { revenue: Math.round(revenue), grossProfit: Math.round(revenue-total*1.05), tcePerDay: Math.round((revenue-total*1.05)/(sail+4)), costPerMt: +(total*1.05/p.cargoQty).toFixed(2), breakevenRate: +(total*1.05/p.cargoQty).toFixed(2) },
  };
}

window.renderVoyage = renderVoyage;
window.runVoyageCalc = runVoyageCalc;
