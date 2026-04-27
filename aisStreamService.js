/**
 * AISStream WebSocket Service
 * ─────────────────────────────────────────────────────────────
 * Connects to wss://stream.aisstream.io/v0/stream
 * Maintains an in-memory vessel store updated in real-time.
 * Clients poll GET /api/v1/map/vessels for the latest snapshot.
 *
 * AISStream docs: https://aisstream.io/documentation
 */

const WebSocket = require('ws');
const config    = require('../lib/config');

// ── In-memory vessel store ─────────────────────────────────────
// Keyed by MMSI for O(1) upserts. Max 5 000 vessels to cap RAM.
const MAX_VESSELS = 5_000;
const vessels     = new Map(); // mmsi → VesselRecord
let   wsClient    = null;
let   isConnected = false;
let   reconnectTimer = null;
let   totalMsgsReceived = 0;

// ── Public API ─────────────────────────────────────────────────

/** Start the WebSocket listener. Call once from server/index.js */
function start() {
  const apiKey = config.apis.aisStream;
  if (!apiKey) {
    console.log('  ⚠  AISStream key not set — live map will use mock data');
    return;
  }
  connect(apiKey);
}

/** Returns a snapshot array of all known vessels */
function getVessels() {
  return Array.from(vessels.values());
}

/** Returns a single vessel by MMSI */
function getVesselByMmsi(mmsi) {
  return vessels.get(String(mmsi)) || null;
}

/** Stats for the /api/health endpoint */
function getStats() {
  return {
    connected: isConnected,
    vesselCount: vessels.size,
    totalMessages: totalMsgsReceived,
  };
}

// ── WebSocket lifecycle ────────────────────────────────────────

function connect(apiKey) {
  console.log('  📡  AISStream: connecting…');
  wsClient = new WebSocket('wss://stream.aisstream.io/v0/stream');

  wsClient.on('open', () => {
    isConnected = true;
    console.log('  ✅  AISStream: connected');

    // Subscribe to all position reports worldwide
    // Narrow with bounding boxes for performance in production:
    // e.g. [[[20, -30], [70, 50]]] covers Europe + Med
    const subscription = {
      APIKey: apiKey,
      BoundingBoxes: [[[-90, -180], [90, 180]]], // global
      FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
    };
    wsClient.send(JSON.stringify(subscription));
  });

  wsClient.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      handleMessage(msg);
    } catch (e) {
      // ignore parse errors
    }
  });

  wsClient.on('close', (code) => {
    isConnected = false;
    console.log(`  🔌  AISStream: disconnected (${code}) — reconnecting in 10s`);
    scheduleReconnect(apiKey);
  });

  wsClient.on('error', (err) => {
    console.error('  ❌  AISStream error:', err.message);
    isConnected = false;
  });
}

function scheduleReconnect(apiKey) {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => connect(apiKey), 10_000);
}

// ── Message Handlers ──────────────────────────────────────────

function handleMessage(msg) {
  totalMsgsReceived++;

  const type = msg.MessageType;
  const meta = msg.MetaData || {};

  if (type === 'PositionReport') {
    upsertPosition(meta, msg.Message?.PositionReport);
  } else if (type === 'ShipStaticData') {
    upsertStatic(meta, msg.Message?.ShipStaticData);
  }
}

function upsertPosition(meta, pos) {
  if (!pos) return;
  const mmsi = String(meta.MMSI || pos.UserID);
  if (!mmsi) return;

  // Validate coordinates
  const lat = parseFloat(pos.Latitude);
  const lng = parseFloat(pos.Longitude);
  if (isNaN(lat) || isNaN(lng) || lat === 0 && lng === 0) return;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;

  const existing = vessels.get(mmsi) || { mmsi };

  vessels.set(mmsi, {
    ...existing,
    mmsi,
    name:    meta.ShipName?.trim() || existing.name || 'Unknown',
    lat,
    lng,
    speed:   roundTo1(pos.Sog),          // Speed over ground (knots)
    heading: pos.TrueHeading ?? pos.Cog, // True heading, fallback to COG
    cog:     roundTo1(pos.Cog),          // Course over ground
    navStatus: pos.NavigationalStatus,
    status:  navStatusToLabel(pos.NavigationalStatus),
    updatedAt: Date.now(),
  });

  // Evict oldest if over limit
  if (vessels.size > MAX_VESSELS) evictOldest();
}

function upsertStatic(meta, stat) {
  if (!stat) return;
  const mmsi = String(meta.MMSI || stat.UserID);
  if (!mmsi) return;

  const existing = vessels.get(mmsi) || { mmsi };

  vessels.set(mmsi, {
    ...existing,
    mmsi,
    name:      stat.Name?.trim()         || existing.name || 'Unknown',
    callsign:  stat.CallSign?.trim()     || existing.callsign,
    imo:       stat.ImoNumber            || existing.imo,
    shipType:  stat.Type                 || existing.shipType,
    typeLabel: shipTypeLabel(stat.Type)  || existing.typeLabel,
    length:    stat.Dimension?.A + stat.Dimension?.B || existing.length,
    width:     stat.Dimension?.C + stat.Dimension?.D || existing.width,
    draught:   stat.MaximumStaticDraught || existing.draught,
    dest:      stat.Destination?.trim()  || existing.dest,
    eta:       stat.EtaUtc               || existing.eta,
    updatedAt: existing.updatedAt || Date.now(),
  });
}

// ── Helpers ───────────────────────────────────────────────────

function navStatusToLabel(code) {
  const map = {
    0: 'laden',    // Under way using engine
    1: 'port',     // At anchor
    2: 'port',     // Not under command
    5: 'port',     // Moored
    6: 'port',     // Aground
    8: 'ballast',  // Under way sailing
  };
  return map[code] ?? 'laden';
}

function shipTypeLabel(code) {
  if (!code) return null;
  if (code >= 70 && code <= 79) return 'Cargo';
  if (code >= 80 && code <= 89) return 'Tanker';
  if (code >= 60 && code <= 69) return 'Passenger';
  if (code >= 30 && code <= 39) return 'Fishing';
  if (code === 52)               return 'Tug';
  return 'Other';
}

function shipTypeColor(typeLabel) {
  const map = {
    'Cargo':     '#00d4aa',
    'Tanker':    '#f0a500',
    'Passenger': '#4a9eff',
    'Fishing':   '#22c55e',
    'Tug':       '#8b5cf6',
    'Other':     '#7a98c0',
  };
  return map[typeLabel] || '#7a98c0';
}

function roundTo1(v) {
  return Math.round((v || 0) * 10) / 10;
}

function evictOldest() {
  let oldestKey, oldestTime = Infinity;
  for (const [k, v] of vessels) {
    if ((v.updatedAt || 0) < oldestTime) {
      oldestTime = v.updatedAt;
      oldestKey  = k;
    }
  }
  if (oldestKey) vessels.delete(oldestKey);
}

module.exports = { start, getVessels, getVesselByMmsi, getStats };
