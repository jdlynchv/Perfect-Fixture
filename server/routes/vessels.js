const express = require('express');
const { getVessels, getVesselByMmsi, getVesselCount } = require('../services/vesselService');
const router  = express.Router();

// GET /api/v1/vessels?type=Supramax&status=laden&minDwt=50000
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      type:   req.query.type,
      status: req.query.status,
      minDwt: req.query.minDwt ? parseInt(req.query.minDwt) : undefined,
      maxDwt: req.query.maxDwt ? parseInt(req.query.maxDwt) : undefined,
      region: req.query.region,
    };
    const vessels = await getVessels(filters);
    res.json({ data: vessels, meta: { count: vessels.length, timestamp: new Date().toISOString() } });
  } catch (err) { next(err); }
});

// GET /api/v1/vessels/count
router.get('/count', async (req, res, next) => {
  try {
    const count = await getVesselCount();
    res.json({ data: count });
  } catch (err) { next(err); }
});

// GET /api/v1/vessels/:mmsi
router.get('/:mmsi', async (req, res, next) => {
  try {
    const vessel = await getVesselByMmsi(req.params.mmsi);
    if (!vessel) return res.status(404).json({ error: 'Vessel not found', code: 'VESSEL_NOT_FOUND' });
    res.json({ data: vessel });
  } catch (err) { next(err); }
});

module.exports = router;
