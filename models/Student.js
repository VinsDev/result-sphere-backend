const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  student_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admission_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parents_contact_info: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'Students',
  timestamps: false,
});

module.exports = Student;