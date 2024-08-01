const Teacher = require('../models/Teacher');
const TeacherSubject = require('../models/TeacherSubject'); // Import your TeacherSubject model

// Get all teachers
exports.getAllTeachers = async (req, res, next) => {
    const teachers = await TeacherSubject.findAll();
    res.json(teachers);
};

exports.getTeacherSubjectCountBySchoolId = async (schoolId) => {
    const teacherCount = await TeacherSubject.count({ where: { school_id: schoolId } });
    return { count: teacherCount };
};

// Get all teacher for a specific school
exports.getTeacherSubjectBySchoolId = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const data = await TeacherSubject.findAll({
            where: { school_id },
            include: [
                {
                    model: Teacher,
                    attributes: ['teacher_id', 'full_name', 'email', 'phone_number']
                }
            ],
            attributes: ['teacher_subject_id', 'teacher_id', 'school_id', 'subject_id', 'class_id', 'term_id']
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching student enrollments:', error);
        res.status(500).json({ message: 'An error occurred while fetching student enrollments.' });
    }
};

// Get the number of teachers for a specific school
exports.getTeacherCountBySchoolId = async (schoolId) => {
    const teacherCount = await TeacherSubject.count({ where: { school_id: schoolId } });
    return { count: teacherCount };
};


// Get a teacher by ID
exports.getTeacherById = async (req, res, next) => {
    const { id } = req.params;
    const teacher = await TeacherSubject.findByPk(id);
    if (!teacher) {
        return next(new Error('TeacherSubject not found'));
    }
    res.json(teacher);
};

// Get a teacher by ID
exports.getTeacherByIdToken = async (req, res, next) => {
    const id = req.user.teacher_id;
    const teacher = await TeacherSubject.findOne({ where: { teacher_id: id } });
    if (!teacher) {
        return next(new Error('TeacherSubject not found'));
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
            class_id,  // Updated from 'class' to 'class_id'
            subject_id // Updated from 'subject' to 'subject_id'
        } = req.body;

        const teacher = await TeacherSubject.create({
            school_id,
            full_name,
            email,
            phone_number,
            address,
            highest_qualification,
            class_id,  // Ensure 'class_id' is used here
            subject_id // Ensure 'subject_id' is used here
        });

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
    const [affectedRows] = await TeacherSubject.update(
        { school_id, first_name, last_name, email, phone_number, hire_date, other_relevant_details },
        { where: { teacher_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('TeacherSubject not found'));
    }
    const updatedTeacher = await TeacherSubject.findByPk(id);
    res.json(updatedTeacher);
};

// Delete a teacher by ID
exports.deleteTeacher = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await TeacherSubject.destroy({ where: { teacher_id: id } });
    if (affectedRows === 0) {
        return next(new Error('TeacherSubject not found'));
    }
    res.json({ message: 'TeacherSubject deleted' });
};
