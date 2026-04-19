const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { validateTestInput } = require('../middleware/validation');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// CSV export must come before :id route to avoid conflict
router.get('/export/csv', requireAuth, testController.exportCSV);

// CRUD routes
// POST uses optionalAuth: guests get calculation only, auth users save to DB
router.post('/', optionalAuth, validateTestInput, testController.create);
router.get('/', requireAuth, testController.getAll);
router.get('/:id', requireAuth, testController.getById);
router.delete('/:id', requireAuth, testController.delete);

module.exports = router;
