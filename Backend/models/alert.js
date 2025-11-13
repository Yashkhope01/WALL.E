// backend/models/Alert.js
/**
 * Sequelize model for Alerts.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Alert', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Low',
    },
    // Optional: Link alert to a specific report or user
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Reports', // The table name for the Report model
        key: 'id',
      },
    },
    // Optional: Track who the alert is for (e.g., Municipal, Admin)
    targetRole: {
        type: DataTypes.ENUM('Municipal', 'Admin', 'All'),
        defaultValue: 'All',
    }
  }, {
    timestamps: true,
  });
};