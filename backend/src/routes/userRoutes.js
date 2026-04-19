const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { requireAuth } = require('../middleware/auth');

// GET /api/users/tests - Get logged-in user's saved tests
router.get('/tests', requireAuth, testController.getUserTests);

module.exports = router;
