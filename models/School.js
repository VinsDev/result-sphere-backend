const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const School = sequelize.define('School', {
  school_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  head: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  head_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deputy1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deputy1_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deputy2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deputy2_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  anthem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  vision: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  show_position: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  school_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  school_stamp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Schools',
  timestamps: false,
});

module.exports = School;