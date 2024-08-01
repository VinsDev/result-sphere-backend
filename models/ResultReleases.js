const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');
const AcademicSession = require('./AcademicSession');
const Term = require('./Term');

const ResultRelease = sequelize.define('ResultRelease', {
  release_id: {
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
    allowNull: false,
  },
  session_id: {
    type: DataTypes.INTEGER,
    references: {
      model: AcademicSession,
      key: 'session_id',
    },
    allowNull: false,
  },
  term_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Term,
      key: 'term_id',
    },
    allowNull: false,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'ResultReleases',
  timestamps: false,
});

module.exports = ResultRelease;
