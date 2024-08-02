const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  teacher_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cv_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  highest_qualification: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Teachers'.toLowerCase(),
  timestamps: false,
});

module.exports = Teacher;
