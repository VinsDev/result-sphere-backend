const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Classes
router.get('/', classController.getAllClasses);
router.get('/school', authMiddleware, classController.getClassesBySchoolId);
router.get('/:id', classController.getClassById);
router.post('/', authMiddleware, classController.createClass);
router.put('/:id', authMiddleware, classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
