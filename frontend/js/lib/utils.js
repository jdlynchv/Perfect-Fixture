/**
 * Shared utilities — formatting, DOM helpers, notifications
 */

// ── Number formatting ─────────────────────────────────────────
const fmt = {
  usd:    (n)  => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n.toLocaleString()}`,
  usdFull:(n)  => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits:0 })}`,
  num:    (n)  => Number(n).toLocaleString(),
  pct:    (n)  => `${n > 0 ? '+' : ''}${Number(n).toFixed(2)}%`,
  delta:  (n, suffix='') => `${n > 0 ? '+' : ''}${n}${suffix}`,
  date:   (s)  => s ? new Date(s).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—',
  days:   (s)  => s ? `${Math.round((new Date(s)-Date.now())/86400000)}d` : '—',
};

// ── Delta class helper ────────────────────────────────────────
function deltaClass(val) {
  if (val > 0) return 'delta-up';
  if (val < 0) return 'delta-down';
  return '';
}

// ── Notification toast ────────────────────────────────────────
let _notifTimer;
function notify(msg, type = 'success') {
  const el  = document.getElementById('notification');
  const ico = document.getElementById('notification-icon');
  const txt = document.getElementById('notification-msg');
  if (!el) return;
  ico.textContent = type === 'error' ? '✕' : '✓';
  ico.style.color = type === 'error' ? 'var(--accent-red)' : 'var(--accent-teal)';
  txt.textContent = msg;
  el.classList.add('show');
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

// ── Scroll reveal ─────────────────────────────────────────────
function triggerReveal(container) {
  setTimeout(() => {
    (container || document).querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 55);
    });
  }, 40);
}

// ── Loading skeleton ──────────────────────────────────────────
function skeleton(lines = 3) {
  return Array.from({ length: lines }, () =>
    `<div style="height:16px;background:var(--bg-hover);border-radius:4px;margin-bottom:10px;animation:pulse 1.5s infinite"></div>`
  ).join('');
}

// ── Status badge HTML ─────────────────────────────────────────
function statusBadge(status) {
  const map = {
    laden:   'status-laden',
    ballast: 'status-ballast',
    port:    'status-port',
  };
  return `<span class="status-badge ${map[status] || ''}">${status.toUpperCase()}</span>`;
}

// ── Term status badge HTML ────────────────────────────────────
function termBadge(status) {
  const map = { proposed:'ts-proposed', countered:'ts-countered', agreed:'ts-agreed' };
  return `<span class="term-status ${map[status] || 'ts-proposed'}">${status.toUpperCase()}</span>`;
}

// ── Mini bar chart ────────────────────────────────────────────
function miniChart(values, color = 'var(--accent-teal)', height = 50) {
  const max = Math.max(...values);
  return `<div class="mini-chart" style="height:${height}px">
    ${values.map(v => `<div class="bar" style="height:${Math.round((v/max)*100)}%;--bar-color:${color}"></div>`).join('')}
  </div>`;
}

// ── Progress bar row ──────────────────────────────────────────
function progRow(label, valuePct, displayVal, color = 'var(--accent-teal)') {
  return `<div class="prog-row">
    <span class="prog-label">${label}</span>
    <div class="prog-bar"><div class="prog-fill" style="width:${valuePct}%;background:${color}"></div></div>
    <span class="prog-val">${displayVal}</span>
  </div>`;
}

// ── Section nav switcher ──────────────────────────────────────
function setActiveNav(id) {
  const secs = ['dashboard','voyage','vessels','cargo','fixtures','market','risk'];
  document.querySelectorAll('.topbar-nav button').forEach((b, i) => {
    b.classList.toggle('active', secs[i] === id);
  });
}

window.Utils = { fmt, deltaClass, notify, triggerReveal, skeleton, statusBadge, termBadge, miniChart, progRow, setActiveNav };
