# 🗺️ Live Map Integration — Patch Guide
# Apply these changes to wire up the live map into your existing platform.

# ─────────────────────────────────────────────────────────────────
# 1.  NEW FILES  (already created — copy to your project)
# ─────────────────────────────────────────────────────────────────
#   server/services/aisStreamService.js   ← WebSocket AIS consumer
#   server/routes/map.js                  ← REST endpoints
#   frontend/public/js/sections/liveMap.js ← Map UI section

# ─────────────────────────────────────────────────────────────────
# 2.  server/lib/config.js  — add aisStream key
# ─────────────────────────────────────────────────────────────────
# In the `apis` object, add:

    aisStream: process.env.AISSTREAM_API_KEY || null,

# (Alongside the existing marineTraffic, aishub, vesselFinder lines)


# ─────────────────────────────────────────────────────────────────
# 3.  .env  — add keys
# ─────────────────────────────────────────────────────────────────

# AISStream (WebSocket, free tier) → https://aisstream.io
AISSTREAM_API_KEY=your_aisstream_key_here

# Mapbox (free tier, 50k loads/month) → https://account.mapbox.com
MAPBOX_TOKEN=pk.eyJ1...


# ─────────────────────────────────────────────────────────────────
# 4.  server/index.js  — register route + start WebSocket
# ─────────────────────────────────────────────────────────────────
# At the top with other requires:

    const mapRoutes    = require('./routes/map');
    const aisStream    = require('./services/aisStreamService');

# After the other app.use('/api/v1/...) lines, add:

    app.use('/api/v1/map', mapRoutes);

# After app.listen(...) callback, add:

    aisStream.start();

# Also add a /api/v1/map/config endpoint to expose the Mapbox token
# (add this inside server/routes/map.js — already included):
#   GET /api/v1/map/config → { mapboxToken: process.env.MAPBOX_TOKEN }


# ─────────────────────────────────────────────────────────────────
# 5.  frontend/public/index.html  — add Mapbox GL + new script
# ─────────────────────────────────────────────────────────────────
# In <head>, after the Google Fonts link:

    <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>

# In the <script> block at the bottom, before app.js:

    <script src="/js/sections/liveMap.js"></script>


# ─────────────────────────────────────────────────────────────────
# 6.  frontend/public/index.html  — add nav button
# ─────────────────────────────────────────────────────────────────
# In the .topbar-nav div, add:

    <button onclick="showSection('liveMap')">Live Map</button>


# ─────────────────────────────────────────────────────────────────
# 7.  frontend/public/js/app.js  — register section + cleanup
# ─────────────────────────────────────────────────────────────────
# In the showSection() routing function/switch, add:

    case 'liveMap':
      if (typeof destroyLiveMap === 'function') destroyLiveMap(); // cleanup prev
      renderLiveMap(mc);
      break;

# If app.js uses an object map instead of switch, add:

    liveMap: (mc) => renderLiveMap(mc),


# ─────────────────────────────────────────────────────────────────
# 8.  server/routes/map.js  — add config endpoint
# ─────────────────────────────────────────────────────────────────
# Already included in the file. Verify this route exists:

    router.get('/config', (req, res) => {
      res.json({ mapboxToken: process.env.MAPBOX_TOKEN || null });
    });


# ─────────────────────────────────────────────────────────────────
# 9.  server/index.js health check  — add aisStream stats
# ─────────────────────────────────────────────────────────────────
# In the /api/health route, add to the apis object:

    aisStream: aisStream.getStats(),


# ─────────────────────────────────────────────────────────────────
# DONE. Run:  npm run dev
# Then click "Live Map" in the nav bar.
# With AISSTREAM_API_KEY set you'll see live dots within seconds.
# Without it, mock vessel data renders on the canvas fallback.
# ─────────────────────────────────────────────────────────────────
