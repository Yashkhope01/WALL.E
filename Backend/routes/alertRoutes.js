// backend/routes/alertRoutes.js
/**
 * Routes for fetching Alerts.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getAlerts } = require('../controllers/alertController');

// Accessible by Municipal and Admin roles
router.get('/', auth, role(['Municipal', 'Admin']), getAlerts); 

module.exports = router;