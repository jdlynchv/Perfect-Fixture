/**
 * Vessel Intelligence Section
 * Fetches: GET /api/v1/vessels, /api/v1/vessels/count
 */
async function renderVessels(mc) {
  const { fmt, triggerReveal, statusBadge } = Utils;

  mc.innerHTML = `
  <div class="section-header reveal">
    <div><div class="section-title">AIS Vessel Intelligence</div>
    <div class="section-sub">Live tracking · Availability prediction · Position analysis</div></div>
    <div style="display:flex;gap:8px">
      <select class="form-select" id="filter-type" style="font-size:12px;padding:6px 12px" onchange="applyVesselFilters()">
        <option value="">All Vessel Types</option>
        <option>Capesize</option><option>Panamax</option><option>Supramax</option><option>Ultramax</option><option>Handysize</option>
      </select>
      <select class="form-select" id="filter-status" style="font-size:12px;padding:6px 12px" onchange="applyVesselFilters()">
        <option value="">All Status</option>
        <option value="laden">Laden</option><option value="ballast">Ballast</option><option value="port">In Port</option>
      </select>
    </div>
  </div>

  <div class="map-container reveal" style="margin-bottom:16px">
    <div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:12px;font-weight:600">🌍 Live Vessel Positions</div>
      <div id="vessel-count-bar" style="display:flex;gap:10px;font-size:11px;color:var(--text-secondary)">Loading...</div>
    </div>
    <div class="map-area" id="map-area">
      ${buildMapSvg()}
      <div class="map-controls">
        <button class="map-btn" title="Zoom In">+</button>
        <button class="map-btn" title="Zoom Out">−</button>
        <button class="map-btn" onclick="Utils.notify('Map reset')">⊙</button>
      </div>
      <div class="map-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--accent-teal)"></div>Laden</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--accent-blue)"></div>Ballast</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--accent-amber)"></div>At Port</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--accent-red)"></div>War Risk Zone</div>
      </div>
      <div class="vessel-tooltip" id="vessel-tooltip"></div>
    </div>
  </div>

  <div class="card reveal">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div class="card-label" style="margin:0">🔍 Fleet Intelligence Database</div>
      <input class="form-input" id="vessel-search" placeholder="Search vessel, owner…" style="width:260px;font-size:12px;padding:6px 12px" oninput="filterVesselTable(this.value)">
    </div>
    <div id="vessel-table-wrap">Loading vessels...</div>
  </div>`;

  triggerReveal(mc);

  // Load data
  const [vessels, count] = await Promise.all([
    API.Vessels.list().catch(() => null),
    API.Vessels.count().catch(() => null),
  ]);

  window._allVessels = vessels || MOCK_DATA.vessels;
  const cnt = count || MOCK_DATA.vesselCount;

  document.getElementById('vessel-count-bar').innerHTML =
    `<span>Laden: <strong style="color:var(--accent-teal)">${fmt.num(cnt.laden)}</strong></span>
     <span>Ballast: <strong style="color:var(--accent-blue)">${fmt.num(cnt.ballast)}</strong></span>
     <span>At Port: <strong style="color:var(--accent-amber)">${fmt.num(cnt.inPort)}</strong></span>`;

  renderVesselTable(window._allVessels);
}

function renderVesselTable(vessels) {
  const { fmt, statusBadge } = Utils;
  document.getElementById('vessel-table-wrap').innerHTML = `
  <table class="data-table">
    <thead><tr><th>Vessel</th><th>Type</th><th>DWT</th><th>Lat/Lng</th><th>Speed</th><th>Next Port / ETA</th><th>Status</th><th>Owner</th><th>Action</th></tr></thead>
    <tbody>
      ${vessels.map(v => `<tr>
        <td class="vessel-name">${v.name}</td>
        <td>${v.type}</td>
        <td style="font-family:'JetBrains Mono',monospace">${fmt.num(v.dwt)}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${v.lat.toFixed(1)}°, ${v.lng.toFixed(1)}°</td>
        <td style="font-family:'JetBrains Mono',monospace">${v.speed === 0 ? 'Anchored' : v.speed + ' kn'}</td>
        <td>${v.nextPort} ${v.etaUtc ? '('+Utils.fmt.date(v.etaUtc)+')' : ''}</td>
        <td>${statusBadge(v.status)}</td>
        <td style="color:var(--text-secondary)">${v.owner || '—'}</td>
        <td><button class="btn-secondary" style="font-size:10px;padding:4px 10px"
          onclick="Utils.notify('Contact sent to ${(v.owner||'').replace(/'/g,'\\'')}')">Contact</button></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function filterVesselTable(q) {
  const filtered = (window._allVessels || []).filter(v =>
    v.name.toLowerCase().includes(q.toLowerCase()) ||
    (v.owner||'').toLowerCase().includes(q.toLowerCase()) ||
    v.type.toLowerCase().includes(q.toLowerCase())
  );
  renderVesselTable(filtered);
}

function applyVesselFilters() {
  const type   = document.getElementById('filter-type')?.value;
  const status = document.getElementById('filter-status')?.value;
  const filtered = (window._allVessels || []).filter(v =>
    (!type   || v.type   === type)   &&
    (!status || v.status === status)
  );
  renderVesselTable(filtered);
}

function buildMapSvg() {
  const dots = MOCK_DATA.vessels.map((v, i) => {
    // Convert real lat/lng to SVG coords (rough Mercator)
    const x = ((v.lng + 180) / 360) * 1000;
    const y = ((90 - v.lat) / 180) * 500;
    const color = v.status === 'laden' ? '#00d4aa' : v.status === 'ballast' ? '#4a9eff' : '#f0a500';
    return `<g class="vessel-dot" onclick="showVesselTooltip(${i})" style="cursor:pointer" transform="translate(${x.toFixed(0)},${y.toFixed(0)})">
      <circle r="10" fill="${color}" opacity="0.12"/>
      <circle r="4"  fill="${color}" opacity="0.9"/>
      <circle r="4" fill="none" stroke="${color}" stroke-width="1" opacity="0.4">
        <animate attributeName="r" values="4;10;4" dur="3s" repeatCount="indefinite" begin="${i*0.5}s"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" begin="${i*0.5}s"/>
      </circle>
    </g>`;
  }).join('');

  return `<svg class="map-svg" viewBox="0 0 1000 500">
    <defs>
      <radialGradient id="ocean-grd" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#061525"/>
        <stop offset="100%" stop-color="#020a14"/>
      </radialGradient>
    </defs>
    <rect width="1000" height="500" fill="url(#ocean-grd)"/>
    <path d="M80,60 L200,50 L230,80 L220,150 L180,200 L140,220 L100,200 L70,150 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M160,230 L220,220 L240,280 L230,360 L200,420 L160,430 L140,380 L130,300 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M420,40 L520,35 L540,80 L510,120 L460,130 L420,100 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M430,140 L530,130 L560,200 L550,330 L500,420 L450,420 L400,350 L390,230 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M530,30 L800,20 L850,100 L820,200 L750,230 L650,220 L580,180 L540,120 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <path d="M730,320 L860,310 L880,390 L820,440 L740,440 L700,390 Z" fill="#0d2040" stroke="#1a3054" stroke-width="0.5"/>
    <!-- Red Sea risk zone -->
    <ellipse cx="570" cy="258" rx="50" ry="30" fill="rgba(255,71,87,0.18)" stroke="rgba(255,71,87,0.5)" stroke-width="1.5"/>
    <text x="540" y="295" fill="rgba(255,71,87,0.8)" font-size="9" font-family="JetBrains Mono" font-weight="bold">⚠ RED SEA</text>
    <!-- Hormuz -->
    <ellipse cx="632" cy="225" rx="32" ry="16" fill="rgba(255,71,87,0.12)" stroke="rgba(255,71,87,0.4)" stroke-width="1"/>
    <!-- Trade lanes -->
    <path d="M220,290 Q400,320 540,290 Q650,265 750,250" fill="none" stroke="rgba(0,212,170,0.07)" stroke-width="8"/>
    ${dots}
  </svg>
  <div class="vessel-tooltip" id="vessel-tooltip" style="display:none;position:absolute;top:60px;left:50px;background:var(--bg-card2);border:1px solid var(--border-light);border-radius:8px;padding:12px;font-size:12px;width:200px;z-index:10;box-shadow:0 8px 32px rgba(0,0,0,0.5)"></div>`;
}

function showVesselTooltip(idx) {
  const v   = (window._allVessels || MOCK_DATA.vessels)[idx];
  if (!v) return;
  const tt  = document.getElementById('vessel-tooltip');
  if (!tt) return;
  const colors = { laden:'var(--accent-teal)', ballast:'var(--accent-blue)', port:'var(--accent-amber)' };
  tt.style.display = 'block';
  tt.innerHTML = `
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">${v.name}</div>
    <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">${v.type} · ${Utils.fmt.num(v.dwt)} DWT</div>
    <div style="font-size:11px;display:flex;flex-direction:column;gap:4px">
      <div>Status: <strong style="color:${colors[v.status]}">${v.status.toUpperCase()}</strong></div>
      <div>Speed: <strong>${v.speed} kn</strong></div>
      <div>Next Port: <strong>${v.nextPort}</strong></div>
      <div>Open: <strong>${v.openDate || '—'}, ${v.openPort || '—'}</strong></div>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:10px;font-size:11px" onclick="Utils.notify('Contacting owner for ${v.name.replace(/'/g,"\\'")}...')">📧 Contact Owner</button>`;
  setTimeout(() => { if (tt) tt.style.display = 'none'; }, 5000);
}

window.renderVessels = renderVessels;
window.showVesselTooltip = showVesselTooltip;
window.filterVesselTable = filterVesselTable;
window.applyVesselFilters = applyVesselFilters;
