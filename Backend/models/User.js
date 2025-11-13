// backend/models/User.js
/**
 * Sequelize model for User.
 * Includes email, password (hashed), role, and name.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Citizen', 'Municipal', 'Admin'),
      allowNull: false,
    },
    name: { // Added name field
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalReports: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    badges: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });
};