const Student = require('../models/Student');
const StudentEnrollment = require('../models/StudentEnrollment');
const { Op } = require('sequelize');

// Get all student classes
exports.getAllStudentEnrollments = async (req, res, next) => {
    const StudentEnrollmentes = await StudentEnrollment.findAll();
    res.json(StudentEnrollmentes);
};

// Get all student class for a specific school
exports.getStudentEnrollmentBySchoolId = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { class_id, session_id, term_id } = req.query;

        const whereClause = { school_id };

        if (class_id) whereClause.class_id = class_id;
        if (session_id) whereClause.session_id = session_id;
        if (term_id) whereClause.term_id = term_id;

        const data = await StudentEnrollment.findAll({
            where: whereClause,
            include: [
                {
                    model: Student,
                    attributes: ['student_id', 'full_name', 'admission_number', 'parents_contact_info']
                }
            ],
            attributes: ['enrollment_id', 'school_id', 'student_id', 'class_id', 'session_id', 'term_id']
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching student enrollments:', error);
        res.status(500).json({ message: 'An error occurred while fetching student enrollments.' });
    }
};

exports.importStudentEnrollments = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { studentIds, class_id, session_id, term_id } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty student IDs array.' });
        }

        if (!class_id || !session_id || !term_id) {
            return res.status(400).json({ message: 'Missing required parameters: class_id, session_id, or term_id.' });
        }

        // Find existing enrollments for the given students, class, session, and term
        const existingEnrollments = await StudentEnrollment.findAll({
            where: {
                student_id: { [Op.in]: studentIds },
                school_id,
                class_id,
                session_id,
                term_id
            }
        });

        // Filter out students who are already enrolled
        const alreadyEnrolledStudentIds = existingEnrollments.map(enrollment => enrollment.student_id);
        const studentsToEnroll = studentIds.filter(id => !alreadyEnrolledStudentIds.includes(id));

        // Create new enrollments
        const newEnrollments = studentsToEnroll.map(student_id => ({
            student_id,
            school_id,
            class_id,
            session_id,
            term_id
        }));

        await StudentEnrollment.bulkCreate(newEnrollments);

        res.status(201).json({
            message: 'Students imported successfully.',
            importedCount: studentsToEnroll.length,
            alreadyEnrolledCount: alreadyEnrolledStudentIds.length
        });
    } catch (error) {
        console.error('Error importing student enrollments:', error);
        res.status(500).json({ message: 'An error occurred while importing student enrollments.' });
    }
};

// Get the number of students for a specific school
exports.getStudentEnrollmentCountBySchoolId = async (schoolId) => {
    const studentCount = await StudentEnrollment.count({ where: { school_id: schoolId } });
    return { count: studentCount };
};

exports.getStudentEnrollmentStudentById = async (req, res, next) => {
    const { student_id } = req.params;
    const studentEnrollments = await StudentEnrollment.findAll({ where: { student_id: student_id } });
    res.json(studentEnrollments);
};

// Get a student class by ID
exports.getStudentEnrollmentById = async (req, res, next) => {
    const { id } = req.params;
    const StudentEnrollment = await StudentEnrollment.findByPk(id);
    if (!StudentEnrollment) {
        return next(new Error('StudentEnrollment not found'));
    }
    res.json(StudentEnrollment);
};

// Create a new student class
exports.createStudentEnrollment = async (req, res, next) => {
    const { student_id, class_id, session_id, term_id } = req.body;
    const StudentEnrollment = await StudentEnrollment.create({
        student_id, class_id, session_id, term_id
    });
    res.status(201).json(StudentEnrollment);
};

// Update a student class by ID
exports.updateStudentEnrollment = async (req, res, next) => {
    const { id } = req.params;
    const { student_id, class_id, session_id, term_id } = req.body;
    const [affectedRows] = await StudentEnrollment.update(
        { student_id, class_id, session_id, term_id },
        { where: { student_class_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('StudentEnrollment not found'));
    }
    const updatedStudentEnrollment = await StudentEnrollment.findByPk(id);
    res.json(updatedStudentEnrollment);
};

// Delete a student class by ID
exports.deleteStudentEnrollment = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await StudentEnrollment.destroy({ where: { student_class_id: id } });
    if (affectedRows === 0) {
        return next(new Error('StudentEnrollment not found'));
    }
    res.json({ message: 'StudentEnrollment deleted' });
};
