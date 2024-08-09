const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');

const Class = sequelize.define('Class', {
  class_id: {
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
  class_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Classes',
  timestamps: false,
});

module.exports = Class;
