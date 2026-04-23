const express = require('express');
const { getRisks, getPortCongestion, getRouteRiskScore } = require('../services/riskService');
const router = express.Router();

// GET /api/v1/risk
router.get('/', async (req, res, next) => {
  try { res.json({ data: await getRisks(req.query) }); } catch (err) { next(err); }
});

// GET /api/v1/risk/ports
router.get('/ports', async (req, res, next) => {
  try { res.json({ data: await getPortCongestion() }); } catch (err) { next(err); }
});

// GET /api/v1/risk/route?load=Rotterdam&disch=Qingdao
router.get('/route', async (req, res, next) => {
  try {
    const { load, disch } = req.query;
    if (!load || !disch) return res.status(422).json({ error: 'load and disch ports required', code: 'MISSING_PARAMS' });
    res.json({ data: await getRouteRiskScore(load, disch) });
  } catch (err) { next(err); }
});

module.exports = router;
