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
const { mongoose } = require('./db'); // Import mongoose connection

const app = express();

// --- CORS CONFIGURATION ---
// In production, set ALLOWED_ORIGINS in Render's environment variables.
// Multiple origins can be comma-separated:
//   ALLOWED_ORIGINS=https://walle.vercel.app,https://my-custom-domain.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed or if wildcard '*' is in allowedOrigins
    const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS Blocked: Origin '${origin}' is not in allowed origins list:`, allowedOrigins);
      callback(null, false); // Reject without throwing 500 error
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// --- SETUP AND MIDDLEWARE ---

// Define upload directory path
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory at: ${UPLOAD_DIR}`);
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Root health-check — Render's health monitor and uptime services ping GET /
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'WALL.E API', version: '1.0.0' });
});

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available in app
app.set('io', io);

// --- ROUTES ---

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/municipal', require('./routes/municipalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));