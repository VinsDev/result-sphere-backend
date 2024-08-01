const express = require('express');
const router = express.Router();
const studentEnrollmentController = require('../controllers/studentEnrollmentController');
const authMiddleware = require('../middlewares/authMiddleware');


// Define routes for Student Classes
router.get('/', studentEnrollmentController.getAllStudentEnrollments);
router.get('/school', authMiddleware, studentEnrollmentController.getStudentEnrollmentBySchoolId);
router.post('/import', authMiddleware, studentEnrollmentController.importStudentEnrollments);
router.get('/records/:student_id', studentEnrollmentController.getStudentEnrollmentStudentById);
router.get('/:id', studentEnrollmentController.getStudentEnrollmentById);
router.post('/', studentEnrollmentController.createStudentEnrollment);
router.put('/:id', studentEnrollmentController.updateStudentEnrollment);
router.delete('/:id', studentEnrollmentController.deleteStudentEnrollment);

module.exports = router;
