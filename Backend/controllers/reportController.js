// backend/controllers/reportController.js
/**
 * Controllers for citizen report actions: submit and get own reports.
 * Integrates real AI classification via Python Flask service.
 */

const multer = require('multer');
const path = require('path');
const fetch = require('node-fetch');
const Report = require('../models/Report');
const User = require('../models/User');
const Alert = require('../models/Alert');

// AI Service URL from environment (defaults to localhost:5001)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

exports.upload = multer({ storage });

/**
 * Fallback: random classification used only when AI service is unavailable.
 */
function fallbackClassify() {
  const types = ['Wet', 'Dry', 'E-Waste', 'Mixed'];
  return {
    wasteType: types[Math.floor(Math.random() * types.length)],
    confidence: 0,
    confidencePercent: 0,
    categoryDetail: 'Classified by fallback (AI service unavailable)',
    categoryInfo: {}
  };
}

/**
 * AI Classification: calls the Python Flask AI service.
 * Sends the absolute path of the uploaded image for classification.
 *
 * @param {string} absoluteImagePath - Full disk path to the uploaded image
 * @returns {Promise<{wasteType, confidence, confidencePercent, categoryDetail, categoryInfo}>}
 */
async function aiClassify(absoluteImagePath) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/classify/path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: absoluteImagePath }),
      timeout: 15000  // 15 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`AI service returned ${response.status}: ${errorText}`);
      return fallbackClassify();
    }

    const data = await response.json();

    if (!data.success) {
      console.warn('AI service error:', data.message);
      return fallbackClassify();
    }

    return {
      wasteType: data.wasteType,
      confidence: data.confidence,
      confidencePercent: data.confidencePercent,
      categoryDetail: data.categoryDetail,
      categoryInfo: data.categoryInfo || {}
    };

  } catch (err) {
    // If AI service is not running, fall back to mock
    console.warn('AI service unavailable, using fallback classifier:', err.message);
    return fallbackClassify();
  }
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
    { id: 'first_report', name: 'First Step', icon: '🌱' },
    { id: 'reporter_5', name: 'Eco Starter', icon: '🌿' },
    { id: 'reporter_10', name: 'Green Warrior', icon: '🌳' },
    { id: 'reporter_25', name: 'Eco Champion', icon: '🏆' },
    { id: 'reporter_50', name: 'Planet Saver', icon: '🌍' },
    { id: 'points_100', name: 'Century Club', icon: '💯' },
    { id: 'points_500', name: 'Points Master', icon: '⭐' },
  ];
  
  const conditionMap = {
    'first_report': totalReports >= 1,
    'reporter_5': totalReports >= 5,
    'reporter_10': totalReports >= 10,
    'reporter_25': totalReports >= 25,
    'reporter_50': totalReports >= 50,
    'points_100': points >= 100,
    'points_500': points >= 500,
  };
  
  const newBadges = [];
  for (const badgeDef of badgeDefinitions) {
    const hasBadge = badges.some(b => b.id === badgeDef.id);
    if (conditionMap[badgeDef.id] && !hasBadge) {
      newBadges.push(badgeDef);
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

  // Run AI classification on the uploaded image
  const absoluteImagePath = req.file.path || path.join(__dirname, '..', 'uploads', req.file.filename);
  const aiResult = await aiClassify(absoluteImagePath);
  const wasteType = aiResult.wasteType;

  // Determine area using OpenStreetMap Nominatim reverse geocoding
  let area = 'Unknown';
  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      area = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.address?.state_district || 'Unknown';
    }
  } catch (err) {
    console.warn('Geocoding failed:', err.message);
  }

  try {
    let report = await Report.create({
      imageUrl,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      area,
      wasteType,
      submittedBy: req.user.userId,
    });
    
    // --- GAMIFICATION: Update user stats ---
    const user = await User.findById(req.user.userId);
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
    report = await Report.findById(report._id).populate('submittedBy', 'name email');
    
    // --- CREATE PERSISTENT ALERT ---
    const alertMessage = `New ${wasteType} waste report submitted by ${report.submittedBy.name} near Lat:${report.lat.toFixed(4)}/Lng:${report.lng.toFixed(4)}`;
    await Alert.create({ 
        message: alertMessage, 
        severity: 'High', 
        reportId: report._id,
        targetRole: 'Municipal'
    });
    // ------------------------------------

    const io = req.app.get('io');
    io.emit('newReport', report.toJSON());
    
    // Transform report for frontend
    const transformedReport = {
      _id: report._id,
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
      classification: {
        wasteType: aiResult.wasteType,
        confidence: aiResult.confidence,
        confidencePercent: aiResult.confidencePercent,
        categoryDetail: aiResult.categoryDetail,
        categoryInfo: aiResult.categoryInfo,
        aiPowered: aiResult.confidence > 0  // false if fallback was used
      },
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
    const reports = await Report.find({ submittedBy: req.user.userId }).sort({ createdAt: -1 });
    
    // Transform reports to match frontend expectations
    const transformedReports = reports.map(report => ({
      _id: report._id,
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
    const user = await User.findById(req.user.userId).select('points totalReports badges level name');
    
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
    const topUsers = await User.find({ role: 'Citizen' })
      .select('_id name points totalReports level badges')
      .sort({ points: -1 })
      .limit(10);
    
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