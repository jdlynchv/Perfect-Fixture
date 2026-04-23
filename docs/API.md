# The Perfect Fixture — API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

---

## Health Check
```
GET /api/health
```
Returns server status and which API keys are configured.

```json
{
  "status": "ok",
  "apis": {
    "ais": false,
    "fuel": false,
    "baltic": false,
    "oilprice": false
  }
}
```

---

## Vessels  `/api/v1/vessels`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/vessels` | List all vessels (with optional filters) |
| GET | `/vessels/count` | Aggregated vessel counts by status |
| GET | `/vessels/:mmsi` | Get one vessel by MMSI |

**Query params for `GET /vessels`:**
- `type` — e.g. `Supramax`, `Capesize`
- `status` — `laden`, `ballast`, `port`
- `minDwt` / `maxDwt` — numeric DWT filter
- `region` — region code (when AIS API supports it)

**Response schema (single vessel):**
```json
{
  "mmsi": "636092538",
  "imo": "9780033",
  "name": "MV AURORA STAR",
  "type": "Ultramax",
  "dwt": 63500,
  "flag": "MH",
  "lat": 45.2,
  "lng": -28.4,
  "speed": 12.4,
  "heading": 48,
  "status": "laden",
  "nextPort": "Rotterdam",
  "etaUtc": "2024-01-20T08:00:00Z",
  "lastCargo": "Grain",
  "owner": "Star Bulk Carriers",
  "openDate": "2024-01-21",
  "openPort": "Rotterdam"
}
```

**To connect AIS API:** Set `MARINETRAFFIC_API_KEY` in `.env` — see `server/services/vesselService.js`

---

## Voyage  `/api/v1/voyage`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/voyage/calculate` | Calculate full voyage cost, TCE, P&L |

**Request body:**
```json
{
  "vesselType": "Supramax",
  "dwt": 58000,
  "speedKnots": 12.5,
  "loadPort": "Paranagua",
  "dischPort": "Rotterdam",
  "cargoQty": 55000,
  "freightRate": 28.50,
  "fuelGrade": "VLSFO",
  "route": "auto"
}
```

**Response:**
```json
{
  "route": { "distanceNm": 11240, "sailingDays": 37.6, "canal": "none" },
  "bunker": { "consumptionMt": 1128, "pricePerMt": 582, "totalCost": 656000 },
  "costs":  { "bunker": 656000, "port": 88000, "canal": 0, "insurance": 44000, "total": 876000 },
  "results":{ "revenue": 1567500, "grossProfit": 691500, "tcePerDay": 18240, "costPerMt": 15.93, "breakevenRate": 15.93 }
}
```

---

## Market  `/api/v1/market`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/market` | Full summary (indices + rates + forecast) |
| GET | `/market/indices` | Baltic Exchange indices |
| GET | `/market/rates` | Regional freight rates |
| GET | `/market/forecast` | BDI 30-day AI forecast |

**To connect:** Set `BALTIC_API_KEY` or `FREIGHTOS_API_KEY` — see `server/services/marketService.js`

---

## Fuel  `/api/v1/fuel`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/fuel` | Bunker prices across ports and grades |

**Query params:**
- `grade` — `VLSFO`, `IFO380`, `MGO`, `LNG`
- `port` — port code e.g. `RTM`, `SIN`, `FUJ`

**To connect:** Set `SHIPANDBUNKER_API_KEY` or `OILPRICE_API_KEY` — see `server/services/fuelService.js`

---

## Cargo  `/api/v1/cargo`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cargo` | List open cargoes |
| GET | `/cargo/:id` | Get one cargo |
| POST | `/cargo` | Post a new cargo |

---

## Fixtures  `/api/v1/fixtures`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/fixtures` | List fixtures (filter by `status`) |
| GET | `/fixtures/:id` | Get one fixture with all terms |
| POST | `/fixtures` | Create new fixture |
| PATCH | `/fixtures/:id/terms` | Update a clause (value or status) |
| PATCH | `/fixtures/:id/status` | Update fixture status |

**PATCH terms body:**
```json
{ "clause": "Freight Rate", "status": "agreed" }
```

---

## Risk  `/api/v1/risk`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/risk` | All risk zones |
| GET | `/risk/ports` | Port congestion data |
| GET | `/risk/route?load=X&disch=Y` | Route risk score |

**To connect:** Set `GARDALERT_API_KEY` or `ACLED_API_KEY` — see `server/services/riskService.js`

---

## Adding a New API

1. Add your API key to `.env` (use `.env.example` as template)
2. Open `server/lib/config.js` — key is already registered
3. Open the relevant service file (e.g. `server/services/fuelService.js`)
4. Uncomment or add the `fetchFromYourApi()` function
5. Add the `config.isConfigured('yourApiName')` branch at the top of the service function
6. The frontend will automatically receive real data — no frontend changes needed
