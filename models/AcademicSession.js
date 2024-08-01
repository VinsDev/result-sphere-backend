const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');

const AcademicSession = sequelize.define('AcademicSession', {
  session_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  school_id: {
    type: DataTypes.INTEGER,
    references: {
      model: School,
      key: 'school_id',
    },
  },
  session_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  current_session: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'AcademicSessions',
  timestamps: false,
});

module.exports = AcademicSession;
