// db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import Mongoose models
const User = require('./models/User');
const Report = require('./models/Report');
const Alert = require('./models/alert');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI ;
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Call connection on module load
connectDB();

module.exports = { mongoose, User, Report, Alert };
