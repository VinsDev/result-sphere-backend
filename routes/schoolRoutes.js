const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = require('../config/multer-config');

// Define routes for Schools
router.post('/login', schoolController.loginSchool);
router.get('/check-email', schoolController.checkEmailSchoolAssociation);
router.post('/purchase-units', authMiddleware, schoolController.purchaseUnits);
router.get('/search', schoolController.searchSchools);
router.get('/fetch-all', schoolController.getAllSchools);
router.get('/setup-status', authMiddleware, schoolController.setupStatus);
router.get('/show-position', authMiddleware, schoolController.getShowPosition);
router.get('/stats', authMiddleware, schoolController.getSchoolStats);
router.get('/this', authMiddleware, schoolController.getSchool);
router.get('/:school_id', schoolController.getSchoolById);
router.post('/', upload.fields([
    { name: 'head_image', maxCount: 1 },
    { name: 'deputy1_image', maxCount: 1 },
    { name: 'deputy2_image', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'school_image', maxCount: 1 },
]), schoolController.createSchool);
router.put('/show-position', authMiddleware, schoolController.updateShowPosition);
router.put('/this', authMiddleware, upload.fields([
    { name: 'head_image', maxCount: 1 },
    { name: 'deputy1_image', maxCount: 1 },
    { name: 'deputy2_image', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'school_image', maxCount: 1 },
    { name: 'school_stamp', maxCount: 1 },
]), schoolController.updateSchool);
router.delete('/:id', schoolController.deleteSchool);

router.post('/check-token', schoolController.checkToken);

module.exports = router;
