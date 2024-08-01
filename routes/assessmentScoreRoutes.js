const express = require('express');
const router = express.Router();
const assessmentScoreController = require('../controllers/assessmentScoreController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', assessmentScoreController.createAssessmentScore);
router.get('/', assessmentScoreController.getAllAssessmentScores);
router.get('/check-status',authMiddleware, assessmentScoreController.checkAssessmentScoreStatus);
router.get('/school/:school_id', assessmentScoreController.getAssessmentScoreBySchoolId);
router.get('/:id', assessmentScoreController.getAssessmentScoreById);
router.put('/:id', assessmentScoreController.updateAssessmentScoreById);
router.delete('/:id', assessmentScoreController.deleteAssessmentScoreById);

module.exports = router;
