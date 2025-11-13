// backend/models/Report.js
/**
 * Sequelize model for Report.
 * Includes image URL, lat, lng, status, waste type, submitter, and timestamps.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'In Progress', 'Collected'), // Updated enum
      defaultValue: 'Pending',
    },
    wasteType: {
      type: DataTypes.ENUM('Wet', 'Dry', 'E-Waste', 'Mixed'),
      allowNull: false,
    },
    submittedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    collectedAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
  });
};