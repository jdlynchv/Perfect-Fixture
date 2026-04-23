/**
 * App Bootstrap — The Perfect Fixture
 * Handles: navigation, ticker, modal, vessel count refresh
 */

// ── Section Router ────────────────────────────────────────────
function showSection(id) {
  Utils.setActiveNav(id);
  const mc = document.getElementById('main-content');
  mc.innerHTML = '';

  const renderers = {
    dashboard: renderDashboard,
    voyage:    renderVoyage,
    vessels:   renderVessels,
    cargo:     renderCargo,
    fixtures:  renderFixtures,
    market:    renderMarket,
    risk:      renderRisk,
  };

  const fn = renderers[id];
  if (fn) fn(mc);
  else mc.innerHTML = `<div style="color:var(--text-secondary);padding:40px">Section not found.</div>`;
}

// ── Ticker ────────────────────────────────────────────────────
async function initTicker() {
  const items = MOCK_DATA.ticker; // replace with API.Market.indices() if desired
  const html  = [...items, ...items].map(i => `
  <div class="ticker-item">
    <span class="ticker-name">${i.name}</span>
    <span class="ticker-val">${i.value}</span>
    <span class="ticker-chg ${i.up ? 'delta-up' : 'delta-down'}">${i.up ? '▲' : '▼'}${i.change}</span>
  </div>`).join('');
  const el = document.getElementById('ticker-inner');
  if (el) el.innerHTML = html;
}

// ── Vessel count refresh ──────────────────────────────────────
async function refreshVesselCount() {
  const data = await API.Vessels.count().catch(() => null);
  const total = data?.total || MOCK_DATA.vesselCount.total;
  const el = document.getElementById('vessel-count');
  if (el) el.textContent = Utils.fmt.num(total + Math.floor(Math.random() * 10 - 5));
}

// ── Alert Modal ───────────────────────────────────────────────
function showAlertModal() {
  const modal = document.getElementById('alert-modal');
  if (!modal) return;
  const risks = MOCK_DATA.risks.filter(r => r.level !== 'LOW');
  document.getElementById('modal-alerts').innerHTML = risks.map(r => `
  <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
    <div style="width:8px;height:8px;border-radius:50%;background:${r.level==='HIGH'?'var(--accent-red)':'var(--accent-amber)'};margin-top:4px;flex-shrink:0"></div>
    <div style="flex:1;font-size:13px;color:var(--text-secondary)">
      <strong style="color:var(--text-primary)">${r.region}:</strong> ${r.description.slice(0, 80)}…
    </div>
    <div style="font-size:11px;color:var(--text-dim);white-space:nowrap">${r.level}</div>
  </div>`).join('');
  modal.classList.add('show');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// ── Modal overlay click ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  });
});

// ── Health check badge ────────────────────────────────────────
async function checkApiHealth() {
  const health = await API.Health.check();
  const indicator = document.getElementById('api-health');
  if (!indicator) return;
  if (health?.status === 'ok') {
    indicator.title = 'Backend connected';
    indicator.style.color = 'var(--green)';
  } else {
    indicator.title = 'Running in offline/mock mode';
    indicator.style.color = 'var(--accent-amber)';
  }
}

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  await initTicker();
  showSection('dashboard');
  checkApiHealth();
  // Refresh vessel count every 10s
  setInterval(refreshVesselCount, 10_000);
});

window.showSection    = showSection;
window.showAlertModal = showAlertModal;
window.closeModal     = closeModal;
