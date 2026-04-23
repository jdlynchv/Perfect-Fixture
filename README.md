# ⚓ The Perfect Fixture
### Maritime Intelligence & Digital Fixture Platform

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — add any API keys you have (all are optional, mock data is the fallback)

# 3. Run the server
npm run dev
# → http://localhost:3001

# 4. Or open the standalone HTML (no server needed)
open frontend/public/the-perfect-fixture-standalone.html
```

---

## Project Structure

```
perfect-fixture/
├── server/
│   ├── index.js                  ← Express server entry
│   ├── routes/
│   │   ├── vessels.js            ← GET /api/v1/vessels
│   │   ├── voyage.js             ← POST /api/v1/voyage/calculate
│   │   ├── market.js             ← GET /api/v1/market
│   │   ├── fuel.js               ← GET /api/v1/fuel
│   │   ├── fixtures.js           ← CRUD /api/v1/fixtures
│   │   ├── risk.js               ← GET /api/v1/risk
│   │   └── cargo.js              ← CRUD /api/v1/cargo
│   ├── services/
│   │   ├── vesselService.js      ← AIS integration point
│   │   ├── fuelService.js        ← Bunker/oil price integration
│   │   ├── marketService.js      ← Baltic indices integration
│   │   ├── voyageService.js      ← Voyage calculation engine
│   │   └── riskService.js        ← Risk/geopolitical integration
│   └── lib/
│       ├── config.js             ← Typed env config (all API keys)
│       └── mockData.js           ← ALL mock data in one place
│
├── frontend/
│   ├── public/                   ← Served statically by Express
│   │   ├── index.html            ← Main entry point
│   │   ├── css/main.css
│   │   └── js/
│   │       ├── lib/
│   │       │   ├── api.js        ← All API calls go here
│   │       │   ├── mockData.js   ← Frontend fallback data
│   │       │   └── utils.js      ← Formatting, DOM helpers
│   │       ├── sections/
│   │       │   ├── dashboard.js
│   │       │   ├── voyage.js
│   │       │   ├── vessels.js
│   │       │   └── sections.js   ← market, cargo, fixtures, risk
│   │       └── app.js            ← Router, ticker, bootstrap
│   └── the-perfect-fixture-standalone.html  ← Full self-contained demo
│
├── docs/
│   └── API.md                    ← Full API documentation
├── .env.example                  ← All API key slots documented
└── README.md
```

---

## Connecting Real APIs

All mock data lives in **`server/lib/mockData.js`**.  
All API connection points are in **`server/services/`**.

The pattern is simple — every service checks if a key is configured:

```js
if (config.isConfigured('marineTraffic')) {
  return fetchFromMarineTraffic(filters);  // real API
}
return MOCK_VESSELS;  // fallback
```

### API Connection Map

| Data | Mock Location | Service File | .env Key |
|------|--------------|--------------|----------|
| AIS Vessel Positions | `MOCK_VESSELS` | `vesselService.js` | `MARINETRAFFIC_API_KEY` |
| Bunker / Fuel Prices | `MOCK_FUEL_PRICES` | `fuelService.js` | `SHIPANDBUNKER_API_KEY` |
| Baltic Indices (BDI etc.) | `MOCK_INDICES` | `marketService.js` | `BALTIC_API_KEY` |
| Oil Price (crude) | derived | `fuelService.js` | `OILPRICE_API_KEY` |
| Risk / War Zones | `MOCK_RISKS` | `riskService.js` | `GARDALERT_API_KEY` |
| Port Congestion | `MOCK_PORTS` | `riskService.js` | `PORTWATCH_BASE_URL` |
| Conflict Data | `MOCK_RISKS` | `riskService.js` | `ACLED_API_KEY` |
| BDI Forecast | `MOCK_BDI_FORECAST` | `marketService.js` | *(ML model / custom)* |

---

## API Providers & Sign-up Links

| Provider | Data | URL |
|----------|------|-----|
| MarineTraffic | AIS vessel positions | https://www.marinetraffic.com/en/ais-api-services |
| AISHub | AIS (free tier) | https://www.aishub.net/api |
| VesselFinder | AIS vessel positions | https://www.vesselfinder.com/api |
| Ship & Bunker | Bunker prices | https://shipandbunker.com/api |
| OilPrice API | Crude oil prices | https://oilpriceapi.com |
| EIA | US energy data (free) | https://www.eia.gov/opendata/ |
| Baltic Exchange | BDI/BSI/BPI indices | https://www.balticexchange.com/en/data-services.html |
| Freightos FBX | Container freight index | https://fbx.freightos.com |
| PortWatch (IMF) | Port congestion (free) | https://portwatch.imf.org |
| GardAlert | War risk zones | https://www.gard.no |
| ACLED | Conflict data (free) | https://acleddata.com/api/ |

---

## Adding a Database (PostgreSQL)

The fixture and cargo routes currently use in-memory arrays. To persist:

```bash
npm install drizzle-orm postgres
# Add DATABASE_URL to .env
```

Then replace the in-memory arrays in `server/routes/fixtures.js` and `server/routes/cargo.js`
with Drizzle repository calls. See `docs/API.md` for schema suggestions.

---

## Scripts

```bash
npm run dev      # nodemon hot-reload server
npm start        # production server
```

---

## Stack
- **Backend:** Node.js + Express
- **Frontend:** Vanilla JS (modular, no build step required)
- **Styling:** CSS custom properties, no framework
- **Maps:** SVG (replace with Mapbox GL JS for production)
- **Fonts:** Space Grotesk · JetBrains Mono · Syne (Google Fonts)
