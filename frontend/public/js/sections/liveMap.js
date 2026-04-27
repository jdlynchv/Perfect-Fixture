

// ── Colour palette matching the platform design system ─────────
const SHIP_COLORS = {
  Cargo:     '#00d4aa',
  Tanker:    '#f0a500',
  Passenger: '#4a9eff',
  Fishing:   '#22c55e',
  Tug:       '#8b5cf6',
  Other:     '#7a98c0',
};

const STATUS_COLORS = {
  laden:   '#00d4aa',
  ballast: '#4a9eff',
  port:    '#f0a500',
};

// ── State ─────────────────────────────────────────────────────
let mapInstance     = null;
let pollInterval    = null;
let selectedVessel  = null;
let allVessels      = [];
let activeFilter    = 'all';

// ── Main render ───────────────────────────────────────────────
async function renderLiveMap(mc) {
  mc.innerHTML = `
  <div class="section-header reveal">
    <div>
      <div class="section-title">🗺️ Live Vessel Map</div>
      <div class="section-sub" id="map-sub">Connecting to AIS stream…</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <div id="map-live-pill" class="live-indicator">
        <div class="live-dot"></div>
        <span id="map-vessel-count">—</span> vessels
      </div>
    </div>
  </div>

  <!-- Filter bar -->
  <div class="card reveal" style="padding:10px 16px;margin-bottom:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <span style="font-size:11px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Filter:</span>
    ${['all','Cargo','Tanker','Passenger','Fishing','Tug','Other'].map(t => `
      <button class="map-filter-btn ${t==='all'?'active':''}"
              data-type="${t}"
              onclick="setMapFilter('${t}')"
              style="
                font-size:11px;padding:4px 12px;border-radius:20px;cursor:pointer;
                background:${t==='all' ? 'var(--accent-teal-glow)' : 'var(--bg-card2)'};
                border:1px solid ${t==='all' ? 'rgba(0,212,170,.35)' : 'var(--border)'};
                color:${t==='all' ? 'var(--accent-teal)' : 'var(--text-secondary)'};
                transition:all .15s;font-family:inherit
              ">
        ${t === 'all' ? 'All Types' : t}
        ${t !== 'all' ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${SHIP_COLORS[t]};margin-left:4px;vertical-align:middle"></span>` : ''}
      </button>`).join('')}
    <div style="margin-left:auto;display:flex;gap:6px">
      <button onclick="liveMapZoomIn()"  class="map-btn" title="Zoom In">+</button>
      <button onclick="liveMapZoomOut()" class="map-btn" title="Zoom Out">−</button>
      <button onclick="liveMapReset()"   class="map-btn" title="Reset view">⊙</button>
    </div>
  </div>

  <!-- Map wrapper -->
  <div class="reveal" style="display:flex;gap:12px">
    <div style="flex:1;min-width:0">
      <div id="live-map-container" style="
        width:100%;height:580px;border-radius:8px;
        border:1px solid var(--border);overflow:hidden;
        background:var(--bg-card);position:relative
      ">
        <div id="map-loading" style="
          position:absolute;inset:0;display:flex;align-items:center;
          justify-content:center;flex-direction:column;gap:12px;z-index:10;
          background:var(--bg-card)
        ">
          <div style="width:36px;height:36px;border:3px solid var(--border);
                      border-top-color:var(--accent-teal);border-radius:50%;
                      animation:spin 1s linear infinite"></div>
          <div style="color:var(--text-secondary);font-size:13px">Initialising map…</div>
        </div>
        <div id="live-map" style="width:100%;height:100%"></div>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:16px;padding:8px 4px;flex-wrap:wrap">
        ${Object.entries(SHIP_COLORS).map(([k,c]) => `
          <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-secondary)">
            <div style="width:8px;height:8px;border-radius:50%;background:${c}"></div>${k}
          </div>`).join('')}
      </div>
    </div>

    <!-- Detail panel -->
    <div id="vessel-detail-panel" style="
      width:280px;flex-shrink:0;
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:8px;padding:16px;
      display:flex;flex-direction:column;gap:12px;
      min-height:200px;max-height:620px;overflow-y:auto
    ">
      <div style="color:var(--text-secondary);font-size:12px;text-align:center;margin:auto">
        👆 Click any vessel to see details
      </div>
    </div>
  </div>
  `;

  // Add spin keyframe if not present
  if (!document.getElementById('map-spin-style')) {
    const s = document.createElement('style');
    s.id = 'map-spin-style';
    s.textContent = `@keyframes spin{to{transform:rotate(360deg)}}
    .map-filter-btn:hover{border-color:rgba(0,212,170,.25)!important;color:var(--text-primary)!important;}`;
    document.head.appendChild(s);
  }

  Utils.triggerReveal(mc);
  await initMap();
}

// ── Map initialisation ─────────────────────────────────────────
async function initMap() {
  // Check if Mapbox GL is available
  if (typeof L === 'undefined') {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    await new Promise(function(resolve) {
      var script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  mapInstance = L.map('live-map', { center: [20, 10], zoom: 2, zoomControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapInstance);

  window._markerLayer = L.layerGroup().addTo(mapInstance);
  document.getElementById('map-loading').style.display = 'none';
  startPolling();
}



// ── Polling ───────────────────────────────────────────────────
function startPolling() {
  fetchVessels();
  clearInterval(pollInterval);
  pollInterval = setInterval(fetchVessels, 10_000);
}

async function fetchVessels() {
  try {
    const params = activeFilter !== 'all' ? `?type=${activeFilter}` : '';
    const data   = await fetch(`/api/v1/map/vessels${params}`).then(r => r.json());

    allVessels = data.vessels || [];
    updateMapSource(allVessels);

    // Update HUD
    const countEl = document.getElementById('map-vessel-count');
    if (countEl) countEl.textContent = data.count.toLocaleString();

    const subEl = document.getElementById('map-sub');
    if (subEl) {
      const src = data.source === 'live' ? '🟢 Live AIS stream' : '🟡 Mock data';
      subEl.textContent = `${src} · updated ${new Date().toLocaleTimeString()}`;
    }
  } catch(e) {
    console.error('Map poll error:', e);
  }
}

function updateMapSource(vessels) {
  if (!mapInstance || !window._markerLayer) return;
  window._markerLayer.clearLayers();
  vessels.forEach(function(v) {
    var color = SHIP_COLORS[v.typeLabel] || SHIP_COLORS[v.type] || '#7a98c0';
    var icon = L.divIcon({
      className: '',
      html: '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';opacity:0.85;border:1px solid rgba(255,255,255,0.3)"></div>',
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });
    var marker = L.marker([v.lat, v.lng], { icon: icon });
    marker.on('click', function() { selectVessel(String(v.mmsi)); });
    marker.bindTooltip('<strong>' + (v.name || 'Unknown') + '</strong><br>' + (v.typeLabel || 'Unknown') + ' · ' + (v.speed || 0) + ' kn', { direction: 'top' });
    window._markerLayer.addLayer(marker);
  });
}


// ── Vessel selection ──────────────────────────────────────────
function selectVessel(mmsi) {
  selectedVessel = mmsi;

  // Highlight on map

  // Find vessel data
  const v = allVessels.find(x => String(x.mmsi) === String(mmsi));
  if (!v) return;

  const panel = document.getElementById('vessel-detail-panel');
  const color  = SHIP_COLORS[v.typeLabel] || SHIP_COLORS[v.type] || '#7a98c0';
  const statusColor = STATUS_COLORS[v.status] || '#7a98c0';

  panel.innerHTML = `
    <div style="border-bottom:1px solid var(--border);padding-bottom:12px">
      <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px">${v.name || 'Unknown Vessel'}</div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <span style="
          font-size:10px;padding:2px 8px;border-radius:10px;
          background:${color}22;color:${color};border:1px solid ${color}44
        ">${v.typeLabel || v.type || 'Unknown'}</span>
        <span style="
          font-size:10px;padding:2px 8px;border-radius:10px;
          background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44
        ">${v.status || 'laden'}</span>
      </div>
    </div>

    ${detailRow('MMSI',     v.mmsi)}
    ${v.imo      ? detailRow('IMO',      v.imo)      : ''}
    ${v.callsign ? detailRow('Callsign', v.callsign) : ''}
    ${detailRow('Position', `${(+v.lat).toFixed(4)}°, ${(+v.lng).toFixed(4)}°`)}
    ${detailRow('Speed',    v.speed != null ? `${v.speed} kn` : '—')}
    ${v.heading  ? detailRow('Heading', `${v.heading}°`) : ''}
    ${v.dest     ? detailRow('Destination', v.dest)   : ''}
    ${v.eta      ? detailRow('ETA', new Date(v.eta).toLocaleDateString()) : ''}
    ${v.length   ? detailRow('Length', `${v.length} m`) : ''}
    ${v.draught  ? detailRow('Draught', `${v.draught} m`) : ''}
    ${v.updatedAt ? detailRow('Updated', timeSince(v.updatedAt)) : ''}

    <button onclick="liveMapFlyTo(${v.lng},${v.lat})" class="btn-secondary"
            style="width:100%;margin-top:4px;font-size:11px">
      🎯 Fly to vessel
    </button>
  `;
}

function detailRow(label, value) {
  return `
    <div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;padding:3px 0">
      <span style="color:var(--text-secondary)">${label}</span>
      <span style="color:var(--text-primary);font-family:'JetBrains Mono',monospace;text-align:right">${value}</span>
    </div>`;
}

function timeSince(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

// ── Map controls ──────────────────────────────────────────────
function liveMapZoomIn()  { if (mapInstance) mapInstance.zoomIn(); }
function liveMapZoomOut() { if (mapInstance) mapInstance.zoomOut(); }
function liveMapReset()   { if (mapInstance) mapInstance.setView([20, 10], 2); }
function liveMapFlyTo(lng, lat) { if (mapInstance) mapInstance.flyTo([lat, lng], 6); }

function setMapFilter(type) {
  activeFilter = type;
  // Update button styles
  document.querySelectorAll('.map-filter-btn').forEach(btn => {
    const isActive = btn.dataset.type === type;
    btn.style.background   = isActive ? 'var(--accent-teal-glow)' : 'var(--bg-card2)';
    btn.style.borderColor  = isActive ? 'rgba(0,212,170,.35)'     : 'var(--border)';
    btn.style.color        = isActive ? 'var(--accent-teal)'      : 'var(--text-secondary)';
  });
  fetchVessels();
}




  // Draw grid
  ctx.strokeStyle = '#0a1628';
  ctx.lineWidth = 0.5;
  for (let lng = -180; lng <= 180; lng += 30) {
    const [x] = project(0, lng);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const [,y] = project(lat, 0);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Label
  ctx.fillStyle = '#1a3054';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.fillText('⚠ Canvas fallback — add MAPBOX_TOKEN for full map', 10, 20);

  // Draw vessels
  (allVessels || []).forEach(v => {
    const [x, y] = project(v.lat, v.lng);
    const color = SHIP_COLORS[v.typeLabel] || SHIP_COLORS[v.type] || '#7a98c0';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}



// Clean up when navigating away
function destroyLiveMap() {
  clearInterval(pollInterval);
  if (mapInstance) { mapInstance.remove(); mapInstance = null; window._markerLayer = null; }
}

