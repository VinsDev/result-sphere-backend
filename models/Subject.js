const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');
const Teacher = require('./Teacher');
const Class = require('./Class');
const Term = require('./Term');

const Subject = sequelize.define('Subject', {
  subject_id: {
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
  class_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Class,
      key: 'class_id',
    },
  },
  term_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Term,
      key: 'term_id',
    },
  },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Subjects'.toLowerCase(),
  timestamps: false,
});

module.exports = Subject;
