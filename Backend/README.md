# WALL.E - Backend Server

This directory contains the central Node.js backend for the WALL.E platform. It acts as the bridge between the React frontend, the MongoDB database, and the Python AI classification service.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: Multer
- **External APIs**: node-fetch (for OpenStreetMap Nominatim and Flask AI service communication)
- **Emails**: Nodemailer

## Core Responsibilities

1. **User Management & Auth**: Handles secure registration, login, and role-based access control (Citizen, Municipal, Admin).
2. **Report Pipeline**: Receives image uploads from the frontend, routes the absolute image path to the Python AI service for classification, reverse-geocodes the provided GPS coordinates to find the `area`, and saves the final report to MongoDB.
3. **Gamification Engine**: Automatically awards points, levels up users, and unlocks badges when citizens successfully submit waste reports.
4. **Analytics & Reporting**: Aggregates waste reports by area and waste type using optimized MongoDB pipelines, and sends formatted HTML reports via email to municipal authorities.

## Setup & Running Locally

1. **Install Dependencies**:
   Make sure you are in the `Backend` directory, then run:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in this directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/walle
   JWT_SECRET=your_super_secret_key
   AI_SERVICE_URL=http://localhost:5001

   # Email Configuration (Optional - Defaults to Ethereal Testing)
   # SMTP_HOST=smtp.gmail.com
   # SMTP_PORT=587
   # SMTP_USER=your_email@gmail.com
   # SMTP_PASS=your_app_password
   # MUNICIPAL_EMAIL=municipal@city.gov
   ```

3. **Start the Server**:
   ```bash
   node server.js
   ```
   The backend will start on [http://localhost:5000](http://localhost:5000).

## Performance
The database relies on compound Mongoose indexes (e.g., on `area` and `wasteType`) to ensure that the analytics aggregation pipelines resolve instantly, even with thousands of concurrent reports.
