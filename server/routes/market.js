const express = require('express');
const { getIndices, getFreightRates, getBdiForecast, getMarketSummary } = require('../services/marketService');
const router = express.Router();

// GET /api/v1/market
router.get('/', async (req, res, next) => {
  try { res.json({ data: await getMarketSummary() }); } catch (err) { next(err); }
});

// GET /api/v1/market/indices
router.get('/indices', async (req, res, next) => {
  try { res.json({ data: await getIndices() }); } catch (err) { next(err); }
});

// GET /api/v1/market/rates?segment=Panamax
router.get('/rates', async (req, res, next) => {
  try { res.json({ data: await getFreightRates(req.query.segment) }); } catch (err) { next(err); }
});

// GET /api/v1/market/forecast
router.get('/forecast', async (req, res, next) => {
  try { res.json({ data: await getBdiForecast() }); } catch (err) { next(err); }
});

module.exports = router;
