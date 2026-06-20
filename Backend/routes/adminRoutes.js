// backend/routes/adminRoutes.js
/**
 * Routes for admin actions.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getUsers, deleteUser, getAllReports } = require('../controllers/adminController');
const { getAnalytics, sendReport } = require('../controllers/analyticsController');

router.get('/users', auth, role(['Admin']), getUsers);
router.delete('/users/:id', auth, role(['Admin']), deleteUser);
router.get('/reports', auth, role(['Admin']), getAllReports);
router.get('/analytics', auth, role(['Admin']), getAnalytics);
router.post('/analytics/send', auth, role(['Admin']), sendReport);

module.exports = router;