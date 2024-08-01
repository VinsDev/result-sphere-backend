const express = require('express');
const router = express.Router();
const teacherSubjectController = require('../controllers/teacherSubjectController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Teachers
router.get('/', teacherSubjectController.getAllTeachers);
router.get('/school', authMiddleware, teacherSubjectController.getTeacherSubjectBySchoolId);
router.get('/info', authMiddleware, teacherSubjectController.getTeacherByIdToken);
router.get('/:id', teacherSubjectController.getTeacherById);
router.post('/', authMiddleware, teacherSubjectController.createTeacher);
router.put('/:id', teacherSubjectController.updateTeacher);
router.delete('/:id', teacherSubjectController.deleteTeacher);

module.exports = router;
