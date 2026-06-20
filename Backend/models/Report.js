// backend/models/Report.js
/**
 * Mongoose model for Report.
 * Includes image URL, lat, lng, area, status, waste type, submitter, and timestamps.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    area: {
      type: String,
      default: 'Unknown',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Collected'],
      default: 'Pending',
    },
    wasteType: {
      type: String,
      enum: ['Wet', 'Dry', 'E-Waste', 'Mixed'],
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collectedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Performance optimizations for analytics and fetching
ReportSchema.index({ area: 1, wasteType: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);