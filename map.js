/**
 * Live Map Routes
 * GET  /api/v1/map/vessels        — snapshot of all live vessel positions
 * GET  /api/v1/map/vessels/:mmsi  — single vessel detail
 * GET  /api/v1/map/stats          — connection + count stats
 */
const express = require('express');
const router  = express.Router();
const aisStream = require('../services/aisStreamService');
const { MOCK_VESSELS } = require('../lib/mockData');
const config = require('../lib/config');

// ── GET /api/v1/map/vessels ────────────────────────────────────
router.get('/vessels', (req, res) => {
  const isLive = config.isConfigured('aisStream');
  let vessels  = isLive ? aisStream.getVessels() : MOCK_VESSELS;

  // Optional bbox filter: ?lat1=x&lng1=x&lat2=x&lng2=x
  const { lat1, lng1, lat2, lng2 } = req.query;
  if (lat1 && lng1 && lat2 && lng2) {
    const [minLat, maxLat] = [parseFloat(lat1), parseFloat(lat2)].sort((a,b)=>a-b);
    const [minLng, maxLng] = [parseFloat(lng1), parseFloat(lng2)].sort((a,b)=>a-b);
    vessels = vessels.filter(v =>
      v.lat >= minLat && v.lat <= maxLat &&
      v.lng >= minLng && v.lng <= maxLng
    );
  }

  // Optional type filter: ?type=Cargo
  if (req.query.type) {
    vessels = vessels.filter(v =>
      (v.typeLabel || v.type || '').toLowerCase() === req.query.type.toLowerCase()
    );
  }

  // Cap response to 2000 vessels (client perf)
  const limited = vessels.slice(0, 2_000);

  res.json({
    count: vessels.length,
    returned: limited.length,
    source: isLive ? 'live' : 'mock',
    ts: Date.now(),
    vessels: limited,
  });
});

// ── GET /api/v1/map/vessels/:mmsi ─────────────────────────────
router.get('/vessels/:mmsi', (req, res) => {
  const vessel = config.isConfigured('aisStream')
    ? aisStream.getVesselByMmsi(req.params.mmsi)
    : MOCK_VESSELS.find(v => String(v.mmsi) === req.params.mmsi);

  if (!vessel) return res.status(404).json({ error: 'Vessel not found' });
  res.json(vessel);
});

// ── GET /api/v1/map/config ────────────────────────────────────
// Exposes public tokens to the frontend safely
router.get('/config', (req, res) => {
  res.json({
    mapboxToken: process.env.MAPBOX_TOKEN || null,
    source: config.isConfigured('aisStream') ? 'live' : 'mock',
  });
});

// ── GET /api/v1/map/stats ─────────────────────────────────────
router.get('/stats', (req, res) => {
  res.json({
    ...aisStream.getStats(),
    source: config.isConfigured('aisStream') ? 'live' : 'mock',
  });
});

module.exports = router;
