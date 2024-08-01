const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Teachers
router.get('/', teacherController.getAllTeachers);
router.post('/login', teacherController.loginTeacher);
router.get('/school', authMiddleware, teacherController.getTeacherBySchoolId);
router.get('/info', authMiddleware, teacherController.getTeacherByIdToken);
router.get('/:id', teacherController.getTeacherById);
router.post('/', authMiddleware, teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
