const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const School = require('./School');

const UsageStatistics = sequelize.define('UsageStatistics', {
  school_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: School,
      key: 'school_id',
    },
    onDelete: 'CASCADE',
  },
  units_purchased: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  units_left: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  plan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  usage_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'UsageStatistics',
  timestamps: false,
});

// Hook to update usage_percentage before saving
UsageStatistics.addHook('beforeSave', (usageStat) => {
  if (usageStat.units_purchased !== 0) {
    usageStat.usage_percentage = ((usageStat.units_purchased - usageStat.units_left) / usageStat.units_purchased * 100).toFixed(2);
  } else {
    usageStat.usage_percentage = 0;
  }
});

module.exports = UsageStatistics;
