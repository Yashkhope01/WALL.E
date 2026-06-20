// backend/controllers/municipalController.js
/**
 * Controllers for municipal actions: get active/history reports, update status.
 */

const Report = require('../models/Report');
const User = require('../models/User');

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
    console.error('Error fetching municipal reports:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getActiveReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: { $in: ['Pending', 'In Progress'] } })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'Collected' })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    report.status = status;
    report.updatedAt = new Date();
    if (status === 'Collected') report.collectedAt = new Date();

    await report.save();
    // Reload with User for emit
    const updatedReport = await Report.findById(id).populate('submittedBy', 'name email');
    const io = req.app.get('io');
    io.emit('updateReport', updatedReport.toJSON());
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};