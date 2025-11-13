// backend/server.js
/**
 * Main server entry point for the Smart Waste Management application.
 * Sets up Express server and mounts routes.
 * Integrates Socket.IO for real-time updates.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { sequelize } = require('./db'); // Import sequelize for middleware injection

const app = express();

// --- SETUP AND MIDDLEWARE ---

// Define upload directory path
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist (Fixes ENOENT)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
  console.log(`Created upload directory at: ${UPLOAD_DIR}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Inject sequelize object into request (Fixes 'Cannot read properties of undefined (reading models)')
app.use((req, res, next) => {
    req.sequelize = sequelize;
    next();
});

// Create HTTP server and Socket.IO (Must be defined before app.set('io', io))
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development; restrict in production
  },
});

// Make io available in app
app.set('io', io);

// --- ROUTES ---

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/municipal', require('./routes/municipalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes')); // <-- NEW: Alert Route

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));