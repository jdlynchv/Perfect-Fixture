const express = require('express');
const { calculateVoyage } = require('../services/voyageService');
const router = express.Router();

// POST /api/v1/voyage/calculate
router.post('/calculate', async (req, res, next) => {
  try {
    const result = await calculateVoyage(req.body);
    res.json({ data: result });
  } catch (err) { next(err); }
});

module.exports = router;
