// backend/controllers/adminController.js
/**
 * Controllers for admin actions: user management and analytics.
 */

const User = require('../models/User');
const Report = require('../models/Report');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('_id email role name createdAt').sort({ createdAt: -1 });
    
    // Transform users to match frontend expectations
    const transformedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt
    }));
    
    res.json({ users: transformedUsers });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('submittedBy', 'name email').sort({ createdAt: -1 });
    
    // Transform reports to match frontend expectations
    const transformedReports = reports.map(report => ({
      _id: report._id,
      classification: report.wasteType,
      status: report.status,
      geoLocation: {
        coordinates: [report.lng, report.lat]
      },
      imageUrl: report.imageUrl,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      createdBy: report.submittedBy ? {
        name: report.submittedBy.name,
        email: report.submittedBy.email
      } : null
    }));
    
    res.json({ reports: transformedReports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const collectedReports = await Report.find({ status: 'Collected' });
    let averageCollectionTime = 0;
    if (collectedReports.length > 0) {
      const times = collectedReports.map(r => (r.collectedAt - r.createdAt) / (1000 * 3600)); // in hours
      averageCollectionTime = times.reduce((sum, time) => sum + time, 0) / collectedReports.length;
    }
    res.json({ totalReports, averageCollectionTime });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};