// backend/controllers/alertController.js
const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  // Assuming req.user is set by auth middleware
  const userRole = req.user.role; 
  try {
    const alerts = await Alert.find({
      $or: [
        { targetRole: userRole }, // Alerts specific to the user's role
        { targetRole: 'All' }      // General alerts
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};