// backend/routes/citizenRoutes.js
/**
 * Routes for citizen actions.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { submitReport, upload, getMyReports, getGamificationStats, getLeaderboard } = require('../controllers/reportController');

router.post('/report', auth, role(['Citizen']), upload.single('image'), submitReport);
router.get('/reports', auth, role(['Citizen']), getMyReports);
router.get('/gamification/stats', auth, role(['Citizen']), getGamificationStats);
router.get('/gamification/leaderboard', auth, getLeaderboard);

module.exports = router;