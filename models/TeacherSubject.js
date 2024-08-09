const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Teacher = require('./Teacher');
const Subject = require('./Subject');
const Class = require('./Class');
const School = require('./School');

const TeacherSubject = sequelize.define('TeacherSubject', {
  teacher_subject_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
  },
  school_id: {
    type: DataTypes.INTEGER,
    references: {
      model: School,
      key: 'school_id',
    },
    allowNull: false,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subject,
      key: 'subject_id',
    },
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Class,
      key: 'class_id',
    },
  },
  term_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Class,
      key: 'class_id',
    },
  },
}, {
  tableName: 'TeacherSubjects',
  timestamps: false,
});

module.exports = TeacherSubject;