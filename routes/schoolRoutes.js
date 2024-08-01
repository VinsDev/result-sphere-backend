const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const authMiddleware = require('../middlewares/authMiddleware')

// Define routes for Schools
router.post('/login', schoolController.loginSchool);
router.get('/fetch-all', schoolController.getAllSchools);
router.get('/setup-status', authMiddleware, schoolController.setupStatus);
router.get('/show-position', authMiddleware, schoolController.getShowPosition);
router.get('/stats', authMiddleware, schoolController.getSchoolStats);
router.get('/this', authMiddleware, schoolController.getSchool);
router.post('/', schoolController.createSchool);
router.put('/show-position', authMiddleware, schoolController.updateShowPosition);
router.put('/this', authMiddleware, schoolController.updateSchool);
router.delete('/:id', schoolController.deleteSchool);

router.post('/check-token', schoolController.checkToken);

module.exports = router;
