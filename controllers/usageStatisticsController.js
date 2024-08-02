const UsageStatistics = require('../models/UsageStatistics');

exports.getAllStats = async (req, res) => {
    const sessions = await UsageStatistics.findAll();
    res.json(sessions);
};

exports.getStatsForSchool = async (req, res) => {
    const schoolId = req.user.school_id;
    const stats = await UsageStatistics.findOne({
        where: { school_id: schoolId }
    });
    res.json({ stats: stats });
};

exports.getStatsById = async (req, res) => {
    const { id } = req.params;
    const stats = await UsageStatistics.findByPk(id);
    if (!stats) {
        return res.status(404).json({ message: 'Stats not found' });
    }
    res.json(stats);
};

exports.updateUsageStatistics = async (req, res) => {
    const { id } = req.params;
    const { units_purchased, units_left, plan, status } = req.body;

    try {
        // Find the usage statistics for the specified school
        let usageStatistics = await UsageStatistics.findOne({ where: { id } });

        if (!usageStatistics) {
            return res.status(404).json({ error: 'Usage statistics not found for this school' });
        }

        // Update the fields
        if (units_purchased !== undefined) usageStatistics.units_purchased = units_purchased;
        if (units_left !== undefined) usageStatistics.units_left = units_left;
        if (plan !== undefined) usageStatistics.plan = plan;
        if (status !== undefined) usageStatistics.status = status;

        // Save the updated usage statistics
        await usageStatistics.save();

        return res.json({ message: 'Usage statistics updated successfully', usageStatistics });
    } catch (error) {
        console.error('Error updating usage statistics:', error);
        return res.status(500).json({ error: 'An error occurred while updating usage statistics' });
    }
};

exports.deleteStats = async (req, res) => {
    const { id } = req.params;
    const affectedRows = await UsageStatistics.destroy({ where: { school_id: id } });
    if (affectedRows === 0) {
        return res.status(404).json({ message: 'Usage stats not found' });
    }
    res.json({ message: 'Usage stats deleted' });
};
