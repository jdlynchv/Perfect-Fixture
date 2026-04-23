const express = require('express');
const { MOCK_CARGOES } = require('../lib/mockData');
const router = express.Router();

let cargoes = [...MOCK_CARGOES];

// GET /api/v1/cargo
router.get('/', (req, res) => {
  let result = cargoes;
  if (req.query.status) result = result.filter(c => c.status === req.query.status);
  if (req.query.type  ) result = result.filter(c => c.type.toLowerCase().includes(req.query.type.toLowerCase()));
  res.json({ data: result, meta: { count: result.length } });
});

// GET /api/v1/cargo/:id
router.get('/:id', (req, res) => {
  const cargo = cargoes.find(c => c.id === req.params.id);
  if (!cargo) return res.status(404).json({ error: 'Cargo not found', code: 'CARGO_NOT_FOUND' });
  res.json({ data: cargo });
});

// POST /api/v1/cargo
router.post('/', (req, res) => {
  const id    = `CGO-${new Date().getFullYear()}-${String(cargoes.length + 1).padStart(3, '0')}`;
  const cargo = { id, ...req.body, status: 'open', createdAt: new Date().toISOString() };
  cargoes.push(cargo);
  res.status(201).json({ data: cargo });
});

module.exports = router;
