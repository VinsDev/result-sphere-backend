const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Students
router.post('/login', studentController.loginStudent);
router.get('/', studentController.getAllStudents);
router.get('/school', authMiddleware, studentController.getStudentsBySchoolId);
router.get('/info', authMiddleware, studentController.getStudentByIdToken);
router.get('/:id', studentController.getStudentById);
router.post('/', authMiddleware, studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
