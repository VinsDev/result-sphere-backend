const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import your sequelize instance

const GradeRule = sequelize.define('GradeRule', {
    grade_rule_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Schools', // Table name
            key: 'school_id'
        }
    },
    min_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    max_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    grade: {
        type: DataTypes.CHAR(2),
        allowNull: false
    },
    comment: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'GradeRules',
    timestamps: false
});

module.exports = GradeRule;
