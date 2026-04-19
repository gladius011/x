const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, testController.getStats);

module.exports = router;
