const Teacher = require('../models/Teacher'); // Import your Teacher model
const TeacherSubject = require('../models/TeacherSubject');
const jwt = require('jsonwebtoken');

// Get all teachers
exports.getAllTeachers = async (req, res, next) => {
    const teachers = await Teacher.findAll();
    res.json(teachers);
};

// Login a teacher
exports.loginTeacher = async (req, res, next) => {
    const { email, phone_number } = req.body;
    const teacher = await Teacher.findOne({ where: { email, phone_number } });
    const studentEnrollment = await TeacherSubject.findOne({ where: { teacher_id: teacher.teacher_id } });

    if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
    }
    // Generate JWT token (if using JWT)
    const token = jwt.sign({ teacher_id: teacher.teacher_id, school_id: studentEnrollment.school_id }, 'wxyz', { expiresIn: '1d' });
    res.json({ token: token });
};

// Get all teacher for a specific school
exports.getTeacherBySchoolId = async (req, res) => {
    const school_id = req.user.school_id;
    const teachers = await Teacher.findAll({ where: { school_id: school_id } });
    if (teachers.length === 0) {
        return [res.json({ message: 'No teacher found for this school' })];
    }
    res.json(teachers);
};

// Get the number of teachers for a specific school
exports.getTeacherCountBySchoolId = async (schoolId) => {
    const teacherCount = await Teacher.count({ where: { school_id: schoolId } });
    return { count: teacherCount };
};


// Get a teacher by ID
exports.getTeacherById = async (req, res, next) => {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
        return next(new Error('Teacher not found'));
    }
    res.json(teacher);
};

exports.getTeacherByIdToken = async (req, res, next) => {
    const id = req.user.teacher_id;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
        return next(new Error('Student not found'));
    }
    res.json(teacher);
};

// Create a new teacher
exports.createTeacher = async (req, res, next) => {
    try {
        const school_id = req.user.school_id;
        const {
            full_name,
            email,
            phone_number,
            address,
            highest_qualification,
            class_id,
            subject_id,
            term_id
        } = req.body;

        const teacher = await Teacher.create({
            full_name,
            email,
            phone_number,
            address,
            highest_qualification,
        });

        await TeacherSubject.create({
            teacher_id: teacher.teacher_id,
            school_id,
            subject_id,
            class_id,
            term_id
        })

        res.status(201).json(teacher);
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(400).json({ message: 'Failed to create teacher', error: error.message });
    }
};


// Update a teacher by ID
exports.updateTeacher = async (req, res, next) => {
    const { id } = req.params;
    const { school_id, first_name, last_name, email, phone_number, hire_date, other_relevant_details } = req.body;
    const [affectedRows] = await Teacher.update(
        { school_id, first_name, last_name, email, phone_number, hire_date, other_relevant_details },
        { where: { teacher_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Teacher not found'));
    }
    const updatedTeacher = await Teacher.findByPk(id);
    res.json(updatedTeacher);
};

// Delete a teacher by ID
exports.deleteTeacher = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Teacher.destroy({ where: { teacher_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Teacher not found'));
    }
    res.json({ message: 'Teacher deleted' });
};
