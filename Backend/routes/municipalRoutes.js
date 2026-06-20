// backend/routes/municipalRoutes.js
/**
 * Routes for municipal actions.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getAllReports, getActiveReports, getHistory, updateStatus } = require('../controllers/municipalController');

router.get('/reports', auth, role(['Municipal']), getAllReports);
router.get('/reports/active', auth, role(['Municipal']), getActiveReports);
router.get('/reports/history', auth, role(['Municipal']), getHistory);
router.patch('/reports/:id', auth, role(['Municipal']), updateStatus);

module.exports = router;