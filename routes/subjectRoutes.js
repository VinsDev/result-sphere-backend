const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Subjects
router.get('/', subjectController.getAllSubjects);
router.get('/scores/:subject_id/:session_id/:term_id/:class_id', subjectController.getAssessmentScoresForSubject);
router.put('/scores/:subject_id/:session_id/:term_id/:class_id', subjectController.updateAssessmentScores);
router.get('/school', authMiddleware, subjectController.getSubjectsBySchoolId);
router.get('/:id', subjectController.getSubjectById);
router.post('/', authMiddleware, subjectController.createSubject);
router.put('/:id', authMiddleware, subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;

// http://localhost:3001/subjects/scores/8/15/4/3