const express = require('express');
const { getFuelPrices } = require('../services/fuelService');
const router = express.Router();

// GET /api/v1/fuel?grade=VLSFO&port=RTM
router.get('/', async (req, res, next) => {
  try { res.json({ data: await getFuelPrices(req.query) }); } catch (err) { next(err); }
});

module.exports = router;
