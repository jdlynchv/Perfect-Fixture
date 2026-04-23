/**
 * Market Intelligence Section
 */
async function renderMarket(mc) {
  const { fmt, triggerReveal, miniChart } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div><div class="section-title">Market Intelligence</div>
    <div class="section-sub">Baltic indices · Freight rates · AI forecasting</div></div>
    <div style="display:flex;gap:4px">
      ${['Live','7D','30D','YTD'].map(t=>`<button class="tab ${t==='Live'?'active':''}" onclick="Utils.notify('Switching to ${t} view')">${t}</button>`).join('')}
    </div>
  </div>
  <div id="market-indices" class="market-grid reveal">${Utils.skeleton(6)}</div>
  <div class="dash-grid reveal" id="market-bottom"></div>`;

  triggerReveal(mc);

  const summary = await API.Market.summary().catch(() => null);
  const indices  = (summary?.indices)  || MOCK_DATA.indices;
  const rates    = (summary?.rates)    || MOCK_DATA.rates;
  const forecast = (summary?.forecast) || MOCK_DATA.forecast;

  document.getElementById('market-indices').innerHTML = indices.map(idx => {
    const vals = Array.from({length:12},(_,i)=> {
      const base = idx.value;
      return base + Math.sin(i*0.8 + (idx.changePct>0?1:-1)) * base*0.04 + (idx.changePct>0 ? i*base*0.003 : -i*base*0.002);
    });
    return `<div class="index-card">
      <div class="index-name">${idx.code}</div>
      <div style="font-size:10px;color:var(--text-dim);margin-bottom:4px">${idx.name}</div>
      <div class="index-val">${fmt.num(idx.value)}</div>
      <div class="index-change">
        <span class="trend-chip ${idx.changePct>=0?'trend-up':'trend-down'}">${idx.changePct>=0?'▲':'▼'} ${Math.abs(idx.changePct).toFixed(2)}%</span>
        <span style="color:var(--text-dim);font-size:11px">${idx.change>0?'+':''}${idx.change} pts</span>
      </div>
      ${miniChart(vals, idx.changePct>=0?'var(--accent-teal)':'var(--accent-red)', 40)}
    </div>`;
  }).join('');

  const maxRate = Math.max(...rates.map(r=>r.rateUsd));
  document.getElementById('market-bottom').innerHTML = `
  <div class="card">
    <div class="card-label">📊 Supply / Demand Heatmap</div>
    <div style="margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${[
        {r:'Atlantic',seg:'Capesize',val:'+12%',c:'#22c55e'},
        {r:'Pacific', seg:'Capesize',val:'+8%', c:'#22c55e'},
        {r:'Atlantic',seg:'Panamax', val:'+3%', c:'#4a9eff'},
        {r:'Pacific', seg:'Panamax', val:'-2%', c:'#f0a500'},
        {r:'Atlantic',seg:'Supramax',val:'+6%', c:'#22c55e'},
        {r:'Pacific', seg:'Supramax',val:'+4%', c:'#22c55e'},
        {r:'Atlantic',seg:'Handy',   val:'-5%', c:'#ff4757'},
        {r:'Pacific', seg:'Handy',   val:'-1%', c:'#f0a500'},
      ].map(h=>`<div style="background:${h.c}18;border:1px solid ${h.c}30;border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px">${h.r}</div>
        <div style="font-size:10px;color:var(--text-secondary);margin:2px 0">${h.seg}</div>
        <div style="font-size:16px;font-weight:700;color:${h.c};font-family:'JetBrains Mono',monospace">${h.val}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="card">
    <div class="card-label">🌍 Regional Freight Rates ($/MT)</div>
    ${rates.map(r => Utils.progRow(r.route, Math.round((r.rateUsd/maxRate)*100), `$${r.rateUsd}`,
      r.change>=0?'var(--accent-teal)':'var(--accent-red)')).join('')}
  </div>
  <div class="card">
    <div class="card-label">🤖 AI Market Insights</div>
    <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;font-size:12px">
      ${[
        {icon:'📈', text:'Capesize rates expected to rise 8-12% in Jan as Brazilian grain season begins', tag:'Bullish', tc:'var(--green)'},
        {icon:'⚠️', text:'Red Sea rerouting adding ~$3-4/MT cost on Europe-Asia routes — expected to persist Q1', tag:'Risk', tc:'var(--accent-red)'},
        {icon:'📉', text:'Handysize Atlantic soft — tonnage oversupply expected through Feb', tag:'Bearish', tc:'var(--accent-red)'},
        {icon:'💡', text:'Pacific RV improving — China steel production up 3.2% MoM, iron ore demand firming', tag:'Opportunity', tc:'var(--accent-teal)'},
      ].map(ins=>`<div style="display:flex;gap:10px;padding:10px;background:var(--bg-base);border-radius:6px;border:1px solid var(--border)">
        <span style="font-size:16px;flex-shrink:0">${ins.icon}</span>
        <div><div style="color:var(--text-secondary)">${ins.text}</div>
        <span style="display:inline-block;margin-top:4px;font-size:10px;font-weight:700;color:${ins.tc}">${ins.tag}</span></div>
      </div>`).join('')}
    </div>
  </div>`;
}

/**
 * Cargo Marketplace Section
 */
async function renderCargo(mc) {
  const { fmt, triggerReveal } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div><div class="section-title">Cargo Marketplace</div>
    <div class="section-sub">Open cargoes · Vessel matching · Rate discovery</div></div>
    <button class="btn-primary" onclick="Utils.notify('New cargo posting form opened')">+ Post Cargo</button>
  </div>
  <div class="cargo-grid reveal">
    <div>
      <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:500">Open Cargoes</div>
      <div id="cargo-list">Loading...</div>
    </div>
    <div id="cargo-detail">
      <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:500">Select a cargo to see vessel matches</div>
    </div>
  </div>`;

  triggerReveal(mc);

  const cargoes = await API.Cargo.list().catch(() => null) || MOCK_DATA.cargoes;
  window._cargoes = cargoes;

  document.getElementById('cargo-list').innerHTML = cargoes.map((c, i) => `
  <div class="cargo-card" onclick="selectCargo(${i})" id="cargo-card-${i}">
    <div class="cargo-type"><span>📦</span> ${c.type} <span class="tag tag-teal">${fmt.num(c.quantity)} MT</span></div>
    <div class="cargo-meta">
      <div class="cargo-meta-item"><strong>${c.loadPort}</strong>Load Port</div>
      <div class="cargo-meta-item"><strong>${c.dischPort}</strong>Discharge</div>
      <div class="cargo-meta-item"><strong>${c.laycanFrom} – ${c.laycanTo}</strong>Laycan</div>
      <div class="cargo-meta-item"><strong>$${c.targetRate}/MT</strong>Target Rate</div>
    </div>
  </div>`).join('');
}

function selectCargo(i) {
  const { fmt } = Utils;
  document.querySelectorAll('[id^=cargo-card-]').forEach(c => c.style.borderColor='');
  const el = document.getElementById(`cargo-card-${i}`);
  if (el) el.style.borderColor = 'var(--accent-teal)';
  const c = (window._cargoes || MOCK_DATA.cargoes)[i];
  if (!c) return;

  // Mock vessel matches — replace with POST /api/v1/cargo/:id/matches
  const matches = [
    { name:'MV CAPE MERIDIAN', type:'Capesize', dwt:180000, eta:`${c.loadPort} +3d`, score:94, tce:'$22,100' },
    { name:'MV TITAN GLORY',   type:'Supramax', dwt:58000,  eta:'Open +7d',          score:71, tce:'$16,800' },
    { name:'MV AURORA STAR',   type:'Ultramax', dwt:63500,  eta:'Open +12d',          score:62, tce:'$18,400' },
  ];

  document.getElementById('cargo-detail').innerHTML = `
  <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:500">🤖 AI Vessel Matches — ${c.type} ${fmt.num(c.quantity)} MT</div>
  <div class="match-list">
    ${matches.map(m=>`<div class="match-card">
      <div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">${m.name}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">${m.type} · ${fmt.num(m.dwt)} DWT · ETA: ${m.eta}</div>
        <div style="display:flex;gap:8px">
          <span class="tag tag-teal">Est. TCE: ${m.tce}</span>
          <button class="btn-primary" style="font-size:11px;padding:4px 12px"
            onclick="Utils.notify('Proposal sent to ${m.name} owner')">Send Proposal</button>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;color:var(--accent-teal)">${m.score}%</div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px">Match Score</div>
      </div>
    </div>`).join('')}
  </div>
  <div class="card" style="margin-top:12px">
    <div class="card-label">📊 Market Rate Context</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:10px;font-size:12px">
      <div><div style="color:var(--text-dim);font-size:10px;text-transform:uppercase;letter-spacing:1px">Market Rate</div><div style="font-family:'JetBrains Mono',monospace;font-size:16px">$${(c.targetRate*0.98).toFixed(2)}/MT</div></div>
      <div><div style="color:var(--text-dim);font-size:10px;text-transform:uppercase;letter-spacing:1px">Your Target</div><div style="font-family:'JetBrains Mono',monospace;font-size:16px;color:var(--accent-teal)">$${c.targetRate}/MT</div></div>
      <div><div style="color:var(--text-dim);font-size:10px;text-transform:uppercase;letter-spacing:1px">Charterer</div><div style="font-size:14px;font-weight:600">${c.charterer}</div></div>
    </div>
  </div>`;
}

/**
 * Digital Fixture System Section
 */
async function renderFixtures(mc) {
  const { triggerReveal } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div><div class="section-title">Digital Fixture System</div>
    <div class="section-sub">Live negotiation · Clause tracking · Digital recap generation</div></div>
    <button class="btn-primary" onclick="createFixture()">+ New Fixture</button>
  </div>
  <div class="fixture-grid reveal">
    <div>
      <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:500">Active Fixtures</div>
      <div id="fixture-list">Loading...</div>
    </div>
    <div id="negotiation-room">
      <div class="card" style="color:var(--text-secondary);font-size:13px;padding:32px;text-align:center">Select a fixture to open the negotiation room.</div>
    </div>
  </div>`;

  triggerReveal(mc);

  const fixtures = await API.Fixtures.list().catch(() => null) || MOCK_DATA.fixtures;
  window._fixtures = fixtures;
  renderFixtureList(fixtures);
  if (fixtures.length > 0) openNegotiationRoom(fixtures[0]);
}

function renderFixtureList(fixtures) {
  const statusColor = { negotiating:'var(--accent-amber)', closed:'var(--green)', proposed:'var(--accent-blue)', failed:'var(--accent-red)' };
  document.getElementById('fixture-list').innerHTML = fixtures.map((f,i) => `
  <div class="fixture-card ${i===0?'selected':''}" id="fx-card-${i}" onclick="selectFixture(${i})">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <div class="fixture-card-name">${f.id}</div>
      <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:${statusColor[f.status]||'var(--text-secondary)'}">${f.status}</span>
    </div>
    <div class="fixture-card-meta">${f.cargo} · ${f.loadPort} → ${f.dischPort}</div>
    <div class="fixture-card-meta" style="margin-top:3px">${f.charterer} / ${f.owner}</div>
  </div>`).join('') || '<div style="color:var(--text-dim);font-size:12px">No fixtures found</div>';
}

function selectFixture(i) {
  document.querySelectorAll('.fixture-card').forEach((c,j) => c.classList.toggle('selected', j===i));
  openNegotiationRoom((window._fixtures||MOCK_DATA.fixtures)[i]);
}

function openNegotiationRoom(fx) {
  if (!fx) return;
  const agreedCount = (fx.terms||[]).filter(t=>t.status==='agreed').length;
  const pendingCount = (fx.terms||[]).filter(t=>t.status!=='agreed').length;

  document.getElementById('negotiation-room').innerHTML = `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;overflow:hidden">
    <div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:14px;font-weight:700">Negotiation Room — ${fx.id}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${fx.cargo} · ${fx.loadPort} → ${fx.dischPort} · ${Utils.fmt.num(fx.quantity||0)} MT</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="live-dot"></div>
        <span style="font-size:11px;color:var(--text-secondary)">${pendingCount} clause${pendingCount!==1?'s':''} pending</span>
      </div>
    </div>

    ${fx.terms && fx.terms.length > 0 ? `
    <div style="overflow-x:auto">
      <table class="negotiation-table">
        <thead><tr><th>Clause</th><th>Party A (Charterer)</th><th>Party B (Owner)</th><th>Status</th><th>Revisions</th></tr></thead>
        <tbody>
          ${fx.terms.map((t,i)=>`<tr>
            <td class="clause-name">${t.clause}</td>
            <td><input class="clause-field" value="${t.partyA}" id="fxA-${i}" ${t.status==='agreed'?'style="opacity:0.5"':''}></td>
            <td><input class="clause-field" value="${t.partyB}" id="fxB-${i}" ${t.status==='agreed'?'style="opacity:0.5"':''}></td>
            <td><span class="term-status ts-${t.status}" onclick="cycleFxStatus(this,'${fx.id}','${t.clause}')">${t.status.toUpperCase()}</span></td>
            <td><span style="font-size:10px;color:var(--text-dim);cursor:pointer"
              onclick="Utils.notify('Viewing history for ${t.clause}')">📋 3 revs</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `<div style="padding:24px;color:var(--text-secondary);font-size:13px">No terms defined yet. Start the negotiation by adding clauses.</div>`}

    <div class="fx-actions">
      <button class="btn-primary"    onclick="Utils.notify('Counter-proposal sent — awaiting response')">📤 Send Counter</button>
      <button class="btn-secondary"  onclick="Utils.notify('Agreed terms locked')">🔒 Lock Agreed</button>
      <button class="btn-secondary"  onclick="Utils.notify('PDF recap generated — ${fx.id}.pdf')">📄 Generate Recap</button>
      ${agreedCount === fx.terms?.length && fx.terms?.length > 0
        ? `<span style="color:var(--green);font-size:12px;font-weight:700;margin-left:auto;display:flex;align-items:center">✓ All Agreed — Ready to Close</span>`
        : `<span style="font-size:11px;color:var(--text-dim);display:flex;align-items:center;margin-left:auto">${agreedCount}/${fx.terms?.length||0} terms agreed</span>`}
    </div>
  </div>`;
}

const STATUS_CYCLE = ['proposed','countered','agreed'];
async function cycleFxStatus(el, fxId, clause) {
  const cur  = STATUS_CYCLE.indexOf(el.textContent.toLowerCase());
  const next = STATUS_CYCLE[(cur+1) % STATUS_CYCLE.length];
  el.className = `term-status ts-${next}`;
  el.textContent = next.toUpperCase();
  Utils.notify(`${clause} marked as ${next.toUpperCase()}`);
  // Sync to backend
  await API.Fixtures.updateTerm(fxId, { clause, status: next }).catch(() => null);
}

async function createFixture() {
  const id = await API.Fixtures.create({ cargo:'New Cargo', loadPort:'TBD', dischPort:'TBD', charterer:'', owner:'', terms:[] }).catch(() => null);
  Utils.notify(id ? `Fixture ${id.id} created` : 'Fixture room opened (offline mode)');
}

/**
 * Risk & Alerts Section
 */
async function renderRisk(mc) {
  const { triggerReveal } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div><div class="section-title">Risk & Alerts System</div>
    <div class="section-sub">Global threat intelligence · Route risk scoring · War risk tracking</div></div>
    <div style="display:flex;gap:8px">
      <button class="btn-secondary" onclick="Utils.notify('Alert preferences updated')">⚙ Configure</button>
      <button class="btn-primary"   onclick="Utils.notify('Risk report generated')">📄 Export Report</button>
    </div>
  </div>
  <div class="map-container reveal" style="margin-bottom:16px">
    <div style="padding:10px 14px;border-bottom:1px solid var(--border)"><div style="font-size:12px;font-weight:600">🌍 Global Risk Heat Map</div></div>
    <div class="map-area" style="height:320px">${buildRiskMapSvg()}</div>
  </div>
  <div class="risk-grid reveal">
    <div id="risk-list">Loading...</div>
    <div>
      <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:500">Alert Configuration</div>
      <div class="card" id="alert-config"></div>
    </div>
  </div>`;

  triggerReveal(mc);

  const [risks, ports] = await Promise.all([
    API.Risk.list().catch(() => null),
    API.Risk.ports().catch(() => null),
  ]);

  const riskData  = risks  || MOCK_DATA.risks;
  const portData  = ports  || MOCK_DATA.ports;
  const levelColor = { HIGH:'var(--accent-red)', MEDIUM:'var(--accent-amber)', LOW:'var(--green)' };
  const levelClass = { HIGH:'risk-high', MEDIUM:'risk-med', LOW:'risk-low' };

  document.getElementById('risk-list').innerHTML = `
  <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:500">Risk Register (${riskData.length})</div>
  <div class="risk-list">
    ${riskData.map(r=>`<div class="risk-item">
      <div class="risk-level ${levelClass[r.level]}">${r.level}</div>
      <div style="flex:1">
        <div class="risk-region">${r.region}</div>
        <div class="risk-desc">${r.description}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:11px;color:var(--text-dim)">War Risk Premium</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:${levelColor[r.level]}">+${r.warRiskPremiumPct}%</div>
      </div>
    </div>`).join('')}
  </div>`;

  document.getElementById('alert-config').innerHTML = [
    { label:'War Zone Crossings',   on:true,  color:'var(--accent-red)'   },
    { label:'Piracy Incidents',     on:true,  color:'var(--accent-red)'   },
    { label:'Canal Delays >24h',    on:true,  color:'var(--accent-amber)' },
    { label:'Weather Warnings',     on:false, color:'var(--accent-blue)'  },
    { label:'Fuel Price Spikes >5%',on:true,  color:'var(--accent-amber)' },
    { label:'Vessel ETA Changes',   on:false, color:'var(--accent-blue)'  },
    { label:'Fixture Rate Moves',   on:true,  color:'var(--accent-teal)'  },
  ].map(a=>`<div class="fuel-row" style="cursor:pointer" onclick="toggleAlertPref(this)">
    <span class="fuel-name">${a.label}</span>
    <div style="display:flex;align-items:center;gap:8px">
      <div data-on="${a.on}" style="width:36px;height:18px;background:${a.on?a.color:'var(--bg-base)'};border-radius:9px;border:1px solid ${a.on?a.color:'var(--border)'};position:relative;transition:all 0.2s">
        <div style="width:12px;height:12px;background:white;border-radius:50%;position:absolute;top:2px;${a.on?'right:2px':'left:2px'};transition:all 0.2s;opacity:${a.on?1:0.4}"></div>
      </div>
      <span style="font-size:10px;color:${a.on?'var(--green)':'var(--text-dim)'}">${a.on?'ON':'OFF'}</span>
    </div>
  </div>`).join('');
}

function toggleAlertPref(row) {
  const toggle = row.querySelector('[data-on]');
  const lbl    = row.querySelector('span:last-child');
  const isOn   = toggle.dataset.on === 'true';
  toggle.dataset.on = !isOn;
  lbl.textContent = isOn ? 'OFF' : 'ON';
  lbl.style.color = isOn ? 'var(--text-dim)' : 'var(--green)';
  Utils.notify('Alert preference updated');
}

function buildRiskMapSvg() {
  return `<svg class="map-svg" viewBox="0 0 1000 500">
    <defs><radialGradient id="og2" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#061525"/><stop offset="100%" stop-color="#020a14"/>
    </radialGradient></defs>
    <rect width="1000" height="500" fill="url(#og2)"/>
    <path d="M80,60 L200,50 L230,80 L220,150 L180,200 L140,220 L100,200 L70,150 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M160,230 L220,220 L240,280 L230,360 L200,420 L160,430 L140,380 L130,300 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M420,40 L520,35 L540,80 L510,120 L460,130 L420,100 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M430,140 L530,130 L560,200 L550,330 L500,420 L450,420 L400,350 L390,230 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M530,30 L800,20 L850,100 L820,200 L750,230 L650,220 L580,180 L540,120 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M730,320 L860,310 L880,390 L820,440 L740,440 L700,390 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <!-- HIGH risk zones -->
    <ellipse cx="570" cy="258" rx="50" ry="30" fill="rgba(255,71,87,0.22)" stroke="rgba(255,71,87,0.6)" stroke-width="1.5"/>
    <text x="535" y="295" fill="rgba(255,71,87,0.9)" font-size="9" font-family="JetBrains Mono" font-weight="bold">🔴 RED SEA</text>
    <ellipse cx="632" cy="224" rx="33" ry="17" fill="rgba(255,71,87,0.18)" stroke="rgba(255,71,87,0.5)" stroke-width="1.5"/>
    <text x="607" y="250" fill="rgba(255,71,87,0.8)" font-size="8" font-family="JetBrains Mono">HORMUZ</text>
    <!-- MEDIUM risk zones -->
    <ellipse cx="450" cy="312" rx="45" ry="30" fill="rgba(240,165,0,0.13)" stroke="rgba(240,165,0,0.4)" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="415" y="350" fill="rgba(240,165,0,0.7)" font-size="8" font-family="JetBrains Mono">⚠ GULF OF GUINEA</text>
    <ellipse cx="528" cy="180" rx="15" ry="25" fill="rgba(240,165,0,0.1)" stroke="rgba(240,165,0,0.35)" stroke-width="1" stroke-dasharray="3,2"/>
    <!-- LOW risk zones -->
    <ellipse cx="193" cy="249" rx="18" ry="14" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="172" y="270" fill="rgba(34,197,94,0.5)" font-size="7" font-family="JetBrains Mono">PANAMA</text>
    <div class="map-legend" style="bottom:12px">
      <div class="legend-item"><div class="legend-dot" style="background:var(--accent-red)"></div>HIGH</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--accent-amber)"></div>MEDIUM</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--green)"></div>LOW</div>
    </div>
  </svg>
  <div class="map-legend">
    <div class="legend-item"><div class="legend-dot" style="background:var(--accent-red)"></div>HIGH Risk</div>
    <div class="legend-item"><div class="legend-dot" style="background:var(--accent-amber)"></div>MEDIUM Risk</div>
    <div class="legend-item"><div class="legend-dot" style="background:var(--green)"></div>LOW Risk</div>
  </div>`;
}

window.renderMarket   = renderMarket;
window.renderCargo    = renderCargo;
window.renderFixtures = renderFixtures;
window.renderRisk     = renderRisk;
window.selectCargo    = selectCargo;
window.selectFixture  = selectFixture;
window.cycleFxStatus  = cycleFxStatus;
window.createFixture  = createFixture;
window.toggleAlertPref= toggleAlertPref;

function skeleton(n=3) { return Utils.skeleton(n); }
