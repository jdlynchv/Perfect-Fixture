const express = require('express');
const { MOCK_FIXTURES } = require('../lib/mockData');
const router = express.Router();

// In-memory store (replace with DB: Drizzle/Prisma + PostgreSQL)
let fixtures = [...MOCK_FIXTURES];

// GET /api/v1/fixtures
router.get('/', (req, res) => {
  let result = fixtures;
  if (req.query.status) result = result.filter(f => f.status === req.query.status);
  res.json({ data: result, meta: { count: result.length } });
});

// GET /api/v1/fixtures/:id
router.get('/:id', (req, res) => {
  const fx = fixtures.find(f => f.id === req.params.id);
  if (!fx) return res.status(404).json({ error: 'Fixture not found', code: 'FIXTURE_NOT_FOUND' });
  res.json({ data: fx });
});

// POST /api/v1/fixtures — create new fixture
router.post('/', (req, res) => {
  const id = `FX-${new Date().getFullYear()}-${String(fixtures.length + 1).padStart(3, '0')}`;
  const fx = { id, ...req.body, status: 'proposed', terms: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  fixtures.push(fx);
  res.status(201).json({ data: fx });
});

// PATCH /api/v1/fixtures/:id/terms — update a clause
router.patch('/:id/terms', (req, res) => {
  const fx = fixtures.find(f => f.id === req.params.id);
  if (!fx) return res.status(404).json({ error: 'Fixture not found', code: 'FIXTURE_NOT_FOUND' });

  const { clause, field, value, status } = req.body;
  const term = fx.terms.find(t => t.clause === clause);
  if (term) {
    if (value  !== undefined) term[field] = value;
    if (status !== undefined) term.status = status;
  }

  // Auto-close if all terms agreed
  const allAgreed = fx.terms.length > 0 && fx.terms.every(t => t.status === 'agreed');
  if (allAgreed) fx.status = 'closed';

  fx.updatedAt = new Date().toISOString();
  res.json({ data: fx });
});

// PATCH /api/v1/fixtures/:id/status
router.patch('/:id/status', (req, res) => {
  const fx = fixtures.find(f => f.id === req.params.id);
  if (!fx) return res.status(404).json({ error: 'Fixture not found', code: 'FIXTURE_NOT_FOUND' });
  fx.status    = req.body.status;
  fx.updatedAt = new Date().toISOString();
  res.json({ data: fx });
});

module.exports = router;
