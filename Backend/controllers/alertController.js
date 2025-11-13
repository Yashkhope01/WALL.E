// backend/controllers/alertController.js
const { Alert } = require('../db');
const { Op } = require('sequelize');

exports.getAlerts = async (req, res) => {
  // Assuming req.user is set by auth middleware
  const userRole = req.user.role; 
  try {
    const alerts = await Alert.findAll({
      where: {
        [Op.or]: [
          { targetRole: userRole }, // Alerts specific to the user's role
          { targetRole: 'All' }      // General alerts
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 20 // Limit to recent alerts
    });
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};