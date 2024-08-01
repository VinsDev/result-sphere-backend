const express = require('express');
const router = express.Router();
const gradeRuleController = require('../controllers/gradeRuleController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Grade Rules
router.get('/', gradeRuleController.getAllGradeRules);
router.get('/school', authMiddleware, gradeRuleController.getGradeRulesBySchoolId);
router.post('/', authMiddleware, gradeRuleController.createGradeRule);
router.put('/:id', authMiddleware, gradeRuleController.updateGradeRule);
router.delete('/:id', gradeRuleController.deleteGradeRule);
// router.get('/:id', gradeRuleController.getGradeRuleById);

module.exports = router;
