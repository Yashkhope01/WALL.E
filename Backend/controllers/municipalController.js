// backend/controllers/municipalController.js
/**
 * Controllers for municipal actions: get active/history reports, update status.
 */

const { Report, User } = require('../db');

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
    console.error('Error fetching municipal reports:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getActiveReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { status: ['Pending', 'In Progress'] }, // Updated 'New' to 'Pending'
      include: [{ model: User, attributes: ['name', 'email'] }], // Added name
      order: [['createdAt', 'DESC']],
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { status: 'Collected' },
      include: [{ model: User, attributes: ['name', 'email'] }], // Added name
      order: [['createdAt', 'DESC']],
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    report.status = status;
    report.updatedAt = new Date();
    if (status === 'Collected') report.collectedAt = new Date();

    await report.save();
    // Reload with User for emit
    const updatedReport = await Report.findByPk(id, {
      include: [{ model: User, attributes: ['name', 'email'] }],
    });
    const io = req.app.get('io');
    io.emit('updateReport', updatedReport.toJSON());
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};