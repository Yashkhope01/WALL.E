// backend/controllers/reportController.js
/**
 * Controllers for citizen report actions: submit and get own reports.
 * Integrates real AI classification via Python Flask service.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const Report = require('../models/Report');
const User = require('../models/User');
const Alert = require('../models/alert');

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
const FALLBACK_CATEGORY_INFO = {
  "Wet": {
    "color":       "#4CAF50",
    "icon":        "🌿",
    "description": "Biodegradable organic waste (food, garden waste)",
    "disposal":    "Green compost bin",
    "examples":    ["Fruit peels", "Vegetable scraps", "Food leftovers", "Garden clippings"],
  },
  "Dry": {
    "color":       "#2196F3",
    "icon":        "♻️",
    "description": "Recyclable dry waste (plastic, paper, glass, metal)",
    "disposal":    "Blue recycling bin",
    "examples":    ["Plastic bottles", "Cardboard boxes", "Glass jars", "Metal cans"],
  },
  "E-Waste": {
    "color":       "#FF5722",
    "icon":        "⚡",
    "description": "Electronic waste (devices, batteries, cables, appliances)",
    "disposal":    "Special e-waste collection center",
    "examples":    ["Mobile phones", "Laptops", "Batteries", "Chargers", "TVs"],
  },
  "Mixed": {
    "color":       "#9C27B0",
    "icon":        "🗑️",
    "description": "Mixed or unclassified waste requiring manual sorting",
    "disposal":    "Grey general waste bin",
    "examples":    ["Mixed garbage", "Unidentified items", "Composite materials"],
  }
};

/**
 * Fallback: random classification used only when AI service is unavailable.
 */
function fallbackClassify() {
  const types = ['Wet', 'Dry', 'E-Waste', 'Mixed'];
  const wasteType = types[Math.floor(Math.random() * types.length)];
  const confidence = parseFloat((0.75 + Math.random() * 0.20).toFixed(4));
  const confidencePercent = Math.round(confidence * 100);

  return {
    wasteType,
    confidence,
    confidencePercent,
    categoryDetail: `Classified by fallback (AI service offline) - Simulated ${wasteType} Waste`,
    categoryInfo: FALLBACK_CATEGORY_INFO[wasteType] || {},
    aiPowered: false
  };
}

/**
 * AI Classification: streams image bytes directly to the Flask AI service.
 * Uses form-data so no shared filesystem is required between Render and HF Spaces.
 *
 * @param {string} tempFilePath  - Absolute path to Multer's temporary file on disk
 * @param {string} originalName  - Original filename (for Content-Type inference)
 * @returns {Promise<{wasteType, confidence, confidencePercent, categoryDetail, categoryInfo, aiPowered}>}
 */
async function aiClassify(tempFilePath, originalName) {
  const form = new FormData();
  // Stream the temp file directly — never loads the whole file into memory
  form.append('image', fs.createReadStream(tempFilePath), {
    filename: originalName || 'upload.jpg',
    contentType: 'image/jpeg',
  });

  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/classify`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 30000, // 30 s — HF Spaces free tier can be slow to wake
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const data = response.data;

    if (!data.success) {
      console.warn('AI service returned failure:', data.message);
      return fallbackClassify();
    }

    return {
      wasteType: data.wasteType,
      confidence: data.confidence,
      confidencePercent: data.confidencePercent,
      categoryDetail: data.categoryDetail,
      categoryInfo: data.categoryInfo || {},
      aiPowered: true
    };

  } catch (err) {
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

  const tempFilePath = req.file.path;
  const imageUrl = `/uploads/${req.file.filename}`;

  // Stream image bytes to the Flask AI service, then delete the temp file
  const aiResult = await aiClassify(tempFilePath, req.file.originalname);

  // Clean up temp file from Render's ephemeral disk immediately
  try {
    fs.unlinkSync(tempFilePath);
  } catch (cleanupErr) {
    console.warn('Could not delete temp file:', cleanupErr.message);
  }

  const wasteType = aiResult.wasteType;

  // Determine area using OpenStreetMap Nominatim reverse geocoding
  let area = 'Unknown';
  try {
    const geoRes = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    const addr = geoRes.data?.address;
    area = addr?.city || addr?.town || addr?.village || addr?.county || addr?.state_district || 'Unknown';
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
        aiPowered: aiResult.aiPowered
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