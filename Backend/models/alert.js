// backend/models/Alert.js
/**
 * Mongoose model for Alerts.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const AlertSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
    targetRole: {
      type: String,
      enum: ['Municipal', 'Admin', 'All'],
      default: 'All',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);