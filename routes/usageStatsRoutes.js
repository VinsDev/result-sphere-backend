const express = require('express');
const router = express.Router();
const usageStatisticsController = require('../controllers/usageStatisticsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', usageStatisticsController.getAllStats);
router.get('/school', authMiddleware, usageStatisticsController.getStatsForSchool);
router.get('/:id', usageStatisticsController.getStatsById);
router.put('/:id', usageStatisticsController.updateUsageStatistics);
router.delete('/:id', usageStatisticsController.deleteStats);

module.exports = router;
