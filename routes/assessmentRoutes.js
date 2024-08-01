const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Assessments
router.get('/', assessmentController.getAllAssessments);
router.get('/school', authMiddleware, assessmentController.getAssessmentsBySchoolId);
router.get('/:id', assessmentController.getAssessmentById);
router.post('/', authMiddleware, assessmentController.createAssessment);
router.put('/:id', authMiddleware, assessmentController.updateAssessment);
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;
