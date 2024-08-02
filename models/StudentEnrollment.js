const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Class = require('./Class');
const Term = require('./Term');
const AcademicSession = require('./AcademicSession');
const School = require('./School');

const StudentEnrollment = sequelize.define('StudentEnrollment', {
  enrollment_id: {
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
    allowNull: false,
  },
  school_id: {
    type: DataTypes.INTEGER,
    references: {
      model: School,
      key: 'school_id',
    },
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Class,
      key: 'class_id',
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
  session_id: {
    type: DataTypes.INTEGER,
    references: {
      model: AcademicSession,
      key: 'session_id',
    },
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2), // Precision of 10 and scale of 2
    allowNull: true,
  },
  average: {
    type: DataTypes.DECIMAL(10, 2), // Precision of 10 and scale of 2
    allowNull: true,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'StudentEnrollments'.toLowerCase(),
  timestamps: false,
});

module.exports = StudentEnrollment;
