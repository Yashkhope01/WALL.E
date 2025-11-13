// backend/db.js
/**
 * Database configuration and models export.
 */

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

const User = require('./models/User')(sequelize);
const Report = require('./models/Report')(sequelize);
const Alert = require('./models/alert')(sequelize); // <-- NEW: Import Alert model

// Associations
Report.belongsTo(User, { foreignKey: 'submittedBy' });
User.hasMany(Report, { foreignKey: 'submittedBy' });

// NEW: Alert association (optional, but good practice)
Alert.belongsTo(Report, { foreignKey: 'reportId' });

sequelize.authenticate()
  .then(() => console.log('MySQL connected'))
  .catch(err => console.error('MySQL connection error:', err));

sequelize.sync({ alter: true })
  .then(() => console.log('Models synced'))
  .catch(err => console.error('Model sync error:', err));

module.exports = { sequelize, User, Report, Alert }; // <-- EXPORT Alert