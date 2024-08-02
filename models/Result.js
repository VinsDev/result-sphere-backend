const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Class = require('./Class');
const AcademicSession = require('./AcademicSession');
const Term = require('./Term');
const Subject = require('./Subject');

const Result = sequelize.define('Result', {
  result_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Student,
      key: 'student_id',
    },
  },
  class_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Class,
      key: 'class_id',
    },
  },
  session_id: {
    type: DataTypes.INTEGER,
    references: {
      model: AcademicSession,
      key: 'session_id',
    },
  },
  term_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Term,
      key: 'term_id',
    },
  },
  subject_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Subject,
      key: 'subject_id',
    },
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Allow null if position is not yet computed
  },
  highest_score: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Allow null if highest score is not yet set
  },
  lowest_score: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Allow null if lowest score is not yet set
  },
}, {
  tableName: 'Results'.toLowerCase(),
  timestamps: false,
});

module.exports = Result;
