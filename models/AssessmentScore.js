const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Result = require('./Result');
const Assessment = require('./Assessment');

const AssessmentScore = sequelize.define('AssessmentScore', {
  assessment_score_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  result_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Result,
      key: 'result_id',
    },
  },
  assessment_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Assessment,
      key: 'assessment_id',
    },
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'AssessmentScores'.toLowerCase(),
  timestamps: false,
});

module.exports = AssessmentScore;
