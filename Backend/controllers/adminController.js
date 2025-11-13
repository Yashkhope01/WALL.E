// backend/controllers/adminController.js
/**
 * Controllers for admin actions: user management and analytics.
 */

const { User, Report } = require('../db');
const { Op } = require('sequelize');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: ['id', 'email', 'role', 'name', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    // Transform users to match frontend expectations
    const transformedUsers = users.map(user => ({
      _id: user.id,
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
    await User.destroy({ where: { id } });
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    
    // Transform reports to match frontend expectations
    const transformedReports = reports.map(report => ({
      _id: report.id,
      classification: report.wasteType,
      status: report.status,
      geoLocation: {
        coordinates: [report.lng, report.lat]
      },
      imageUrl: report.imageUrl,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      createdBy: report.User ? {
        name: report.User.name,
        email: report.User.email
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
    const totalReports = await Report.count();
    const collectedReports = await Report.findAll({ where: { status: 'Collected' } });
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