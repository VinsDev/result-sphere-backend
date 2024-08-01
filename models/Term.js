const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');

const Term = sequelize.define('Term', {
  term_id: {
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
  term_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  current_term: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Terms',
  timestamps: false,
});

module.exports = Term;