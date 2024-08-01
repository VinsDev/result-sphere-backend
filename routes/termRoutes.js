const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Terms
router.get('/', termController.getAllTerms);
router.get('/current', authMiddleware, termController.getCurrentTermBySchoolFromRoute);
router.get('/school', authMiddleware, termController.getTermsBySchoolId);
router.post('/', termController.createTerm);
router.put('/set-current/:id', authMiddleware, termController.setCurrentTerm);
router.get('/:id', termController.getTermById);
router.put('/:id', termController.updateTerm);
router.delete('/:id', termController.deleteTerm);

module.exports = router;
