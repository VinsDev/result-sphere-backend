const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const resultReleasesController = require('../controllers/resultReleasesController');

// Define routes for Results
router.get('/all', authMiddleware, resultReleasesController.getAllResultReleasesBySchool);
router.get('/current', authMiddleware, resultReleasesController.getCurrentResultReleasesBySchool);
router.put('/toggle/:id', authMiddleware, resultReleasesController.toggleResultRelease);

module.exports = router;
