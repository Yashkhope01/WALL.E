// backend/models/User.js
/**
 * Mongoose model for User.
 * Includes email, password (hashed), role, and name.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Citizen', 'Municipal', 'Admin'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    totalReports: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [
        {
          id: String,
          name: String,
          icon: String,
        }
      ],
      default: [],
    },
    level: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);