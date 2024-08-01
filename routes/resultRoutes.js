const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const resultController = require('../controllers/resultController');

// Define routes for Results
router.get('/', resultController.getAllResults);
router.get('/preview/:student_id/:class_id/:session_id/:term_id', resultController.getStudentResults);
router.get('/download/:student_id/:class_id/:session_id/:term_id', authMiddleware, resultController.generateStudentResultPDF);
router.get('/master-score-sheet/:class_id/:session_id/:term_id', authMiddleware, resultController.generateMasterScoreSheet);
router.get('/compute-results', authMiddleware, resultController.computeResults);
router.get('/school/:school_id', resultController.getResultsBySchoolId);
router.get('/:id', resultController.getResultById);
router.post('/', resultController.createResult);
router.put('/:id', resultController.updateResult);
router.delete('/:id', resultController.deleteResult);

module.exports = router;
