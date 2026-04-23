require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const vesselRoutes  = require('./routes/vessels');
const voyageRoutes  = require('./routes/voyage');
const marketRoutes  = require('./routes/market');
const fixtureRoutes = require('./routes/fixtures');
const riskRoutes    = require('./routes/risk');
const fuelRoutes    = require('./routes/fuel');
const cargoRoutes   = require('./routes/cargo');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use('/api/', limiter);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/v1/vessels',  vesselRoutes);
app.use('/api/v1/voyage',   voyageRoutes);
app.use('/api/v1/market',   marketRoutes);
app.use('/api/v1/fixtures', fixtureRoutes);
app.use('/api/v1/risk',     riskRoutes);
app.use('/api/v1/fuel',     fuelRoutes);
app.use('/api/v1/cargo',    cargoRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    apis: {
      ais:      !!process.env.MARINETRAFFIC_API_KEY,
      fuel:     !!process.env.SHIPANDBUNKER_API_KEY,
      baltic:   !!process.env.BALTIC_API_KEY,
      oilprice: !!process.env.OILPRICE_API_KEY,
    }
  });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code:  err.code    || 'INTERNAL_ERROR',
  });
});

// ── SPA fallback ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚢  The Perfect Fixture — server running`);
  console.log(`    http://localhost:${PORT}\n`);
});
