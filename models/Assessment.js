const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');

const Assessment = sequelize.define('Assessment', {
  assessment_id: {
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
  assessment_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  max_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Assessments'.toLowerCase(),
  timestamps: false,
});

module.exports = Assessment;
