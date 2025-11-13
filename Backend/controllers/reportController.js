// backend/controllers/reportController.js
/**
 * Controllers for citizen report actions: submit and get own reports.
 * Includes mock AI classification.
 */

const multer = require('multer');
const path = require('path');
const { Report, User, Alert } = require('../db'); // <-- IMPORT Alert

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

exports.upload = multer({ storage });

function mockClassify() {
  const types = ['Wet', 'Dry', 'E-Waste', 'Mixed'];
  return types[Math.floor(Math.random() * types.length)];
}

// Gamification: Award points based on waste type
function calculatePoints(wasteType) {
  const pointsMap = {
    'Wet': 10,
    'Dry': 10,
    'E-Waste': 20,
    'Mixed': 15
  };
  return pointsMap[wasteType] || 10;
}

// Gamification: Check and award badges
function checkBadges(user) {
  const badges = user.badges || [];
  const totalReports = user.totalReports;
  const points = user.points;
  
  const badgeDefinitions = [
    { id: 'first_report', name: 'First Step', condition: totalReports >= 1, icon: '🌱' },
    { id: 'reporter_5', name: 'Eco Starter', condition: totalReports >= 5, icon: '🌿' },
    { id: 'reporter_10', name: 'Green Warrior', condition: totalReports >= 10, icon: '🌳' },
    { id: 'reporter_25', name: 'Eco Champion', condition: totalReports >= 25, icon: '🏆' },
    { id: 'reporter_50', name: 'Planet Saver', condition: totalReports >= 50, icon: '🌍' },
    { id: 'points_100', name: 'Century Club', condition: points >= 100, icon: '💯' },
    { id: 'points_500', name: 'Points Master', condition: points >= 500, icon: '⭐' },
  ];
  
  const newBadges = [];
  for (const badge of badgeDefinitions) {
    if (badge.condition && !badges.some(b => b.id === badge.id)) {
      newBadges.push(badge);
    }
  }
  
  return newBadges;
}

// Gamification: Calculate level
function calculateLevel(points) {
  return Math.floor(points / 50) + 1; // Every 50 points = 1 level
}

exports.submitReport = async (req, res) => {
  const { lat, lng } = req.body;
  if (!req.file) return res.status(400).json({ msg: 'No image uploaded' });

  const imageUrl = `/uploads/${req.file.filename}`;
  const wasteType = mockClassify();

  try {
    let report = await Report.create({
      imageUrl,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      wasteType,
      submittedBy: req.user.userId,
    });
    
    // --- GAMIFICATION: Update user stats ---
    const user = await User.findByPk(req.user.userId);
    const pointsEarned = calculatePoints(wasteType);
    
    user.points = (user.points || 0) + pointsEarned;
    user.totalReports = (user.totalReports || 0) + 1;
    user.level = calculateLevel(user.points);
    
    // Check for new badges
    const newBadges = checkBadges(user);
    if (newBadges.length > 0) {
      user.badges = [...(user.badges || []), ...newBadges];
    }
    
    await user.save();
    // ------------------------------------
    
    // Reload with User for emit
    report = await Report.findByPk(report.id, {
      include: [{ model: User, attributes: ['name', 'email'] }],
    });
    
    // --- CREATE PERSISTENT ALERT ---
    const alertMessage = `New ${wasteType} waste report submitted by ${report.User.name} near Lat:${report.lat.toFixed(4)}/Lng:${report.lng.toFixed(4)}`;
    await Alert.create({ 
        message: alertMessage, 
        severity: 'High', 
        reportId: report.id,
        targetRole: 'Municipal'
    });
    // ------------------------------------

    const io = req.app.get('io');
    io.emit('newReport', report.toJSON());
    
    // Transform report for frontend
    const transformedReport = {
      _id: report.id,
      classification: report.wasteType,
      status: report.status,
      geoLocation: {
        coordinates: [report.lng, report.lat]
      },
      imageUrl: report.imageUrl,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    };
    
    res.json({ 
      report: transformedReport,
      gamification: {
        pointsEarned,
        totalPoints: user.points,
        level: user.level,
        newBadges: newBadges.length > 0 ? newBadges : null
      }
    });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { submittedBy: req.user.userId },
      order: [['createdAt', 'DESC']],
    });
    
    // Transform reports to match frontend expectations
    const transformedReports = reports.map(report => ({
      _id: report.id,
      classification: report.wasteType,
      status: report.status,
      geoLocation: {
        coordinates: [report.lng, report.lat] // [longitude, latitude]
      },
      imageUrl: report.imageUrl,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }));
    
    res.json({ reports: transformedReports });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getGamificationStats = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['points', 'totalReports', 'badges', 'level', 'name']
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Calculate next level progress
    const pointsForNextLevel = (user.level * 50);
    const currentLevelPoints = ((user.level - 1) * 50);
    const progressToNextLevel = ((user.points - currentLevelPoints) / (pointsForNextLevel - currentLevelPoints)) * 100;
    
    res.json({
      stats: {
        points: user.points,
        totalReports: user.totalReports,
        badges: user.badges || [],
        level: user.level,
        name: user.name,
        nextLevelPoints: pointsForNextLevel,
        progressToNextLevel: Math.min(progressToNextLevel, 100)
      }
    });
  } catch (err) {
    console.error('Error fetching gamification stats:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.findAll({
      where: { role: 'Citizen' },
      attributes: ['id', 'name', 'points', 'totalReports', 'level', 'badges'],
      order: [['points', 'DESC']],
      limit: 10
    });
    
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.points,
      totalReports: user.totalReports,
      level: user.level,
      badgeCount: (user.badges || []).length
    }));
    
    res.json({ leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};