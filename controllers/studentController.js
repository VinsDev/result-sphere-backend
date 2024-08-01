const Student = require('../models/Student');
const StudentEnrollment = require('../models/StudentEnrollment');
const Result = require('../models/Result');
const Assessment = require('../models/Assessment');
const AssessmentScore = require('../models/AssessmentScore');
const AcademicSession = require('../models/AcademicSession');
const Subject = require('../models/Subject');
const Term = require('../models/Term');
const Class = require('../models/Class');
const sequelize = require('../config/database');
const jwt = require('jsonwebtoken');

// Get all students
exports.getAllStudents = async (req, res, next) => {
    const students = await Student.findAll();
    res.json(students);
};

// Login a student
exports.loginStudent = async (req, res, next) => {
    const { admission_number, pin } = req.body;
    const student = await Student.findOne({ where: { admission_number, pin } });
    const studentEnrollment = await StudentEnrollment.findOne({ where: { student_id: student.student_id } });

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    // Generate JWT token (if using JWT)
    const token = jwt.sign({ student_id: student.student_id, school_id: studentEnrollment.school_id }, 'wxyz', { expiresIn: '1d' });
    res.json({ token: token });
};

// Get all students for a specific school
exports.getStudentsBySchoolId = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { class_id, term_id, session_id } = req.query;

        let whereClause = { school_id };

        if (class_id) {
            whereClause.class_id = class_id;
        }

        if (term_id) {
            whereClause.term_id = term_id;
        }

        if (session_id) {
            whereClause.session_id = session_id;
        }

        const students = await Student.findAll({
            where: whereClause,
        });

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get the number of students for a specific school
exports.getStudentCountBySchoolId = async (schoolId) => {
    const studentCount = await Student.count({ where: { school_id: schoolId } });
    return { count: studentCount };
};


// Get a student by ID
exports.getStudentById = async (req, res, next) => {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    if (!student) {
        return next(new Error('Student not found'));
    }
    res.json(student);
};

exports.getStudentByIdToken = async (req, res, next) => {
    const id = req.user.student_id;
    const student = await Student.findByPk(id);
    if (!student) {
        return next(new Error('Student not found'));
    }
    res.json(student);
};

exports.createStudent = async (req, res, next) => {
    const school_id = req.user.school_id;
    const {
        class_id,
        term_id,
        session_id,
        full_name,
        admission_number,
        pin,
        // image_url,
        parents_contact_info
    } = req.body;

    try {
        // Start a transaction
        const result = await sequelize.transaction(async (t) => {
            // Create the student
            const student = await Student.create({
                full_name,
                admission_number,
                pin,
                // image_url,
                parents_contact_info
            }, { transaction: t });

            // Create the student enrollment
            const enrollment = await StudentEnrollment.create({
                student_id: student.student_id,
                school_id,
                class_id,
                term_id,
                session_id,
                is_active: true
            }, { transaction: t });

            // Find the student's class, term, and session
            const [studentClass, studentTerm, studentSession] = await Promise.all([
                Class.findByPk(class_id, { transaction: t }),
                Term.findByPk(term_id, { transaction: t }),
                AcademicSession.findByPk(session_id, { transaction: t })
            ]);

            if (!studentClass || !studentTerm || !studentSession) {
                throw new Error('Class, Term, or Academic Session not found');
            }

            // Get subjects for the student's class and term
            const subjects = await Subject.findAll({
                where: {
                    class_id: studentClass.class_id,
                    term_id: studentTerm.term_id
                },
                transaction: t
            });

            // Create results and assessment scores for each subject
            for (const subject of subjects) {
                // Create a result for the student in this subject
                const result = await Result.create({
                    student_id: student.student_id,
                    subject_id: subject.subject_id,
                    class_id: studentClass.class_id,
                    term_id: studentTerm.term_id,
                    session_id: studentSession.session_id,
                    total_score: -1
                }, { transaction: t });

                // Get assessments for the school
                const assessments = await Assessment.findAll({
                    where: { school_id },
                    transaction: t
                });

                // Create assessment scores for each assessment
                for (const assessment of assessments) {
                    await AssessmentScore.create({
                        result_id: result.result_id,
                        assessment_id: assessment.assessment_id, 
                        score: -1
                    }, { transaction: t });
                }
            }

            return { student, enrollment };
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// Update a student by ID
exports.updateStudent = async (req, res, next) => {
    const { id } = req.params;
    const { school_id, first_name, last_name, date_of_birth, gender, admission_date, other_relevant_details } = req.body;
    const [affectedRows] = await Student.update(
        { school_id, first_name, last_name, date_of_birth, gender, admission_date, other_relevant_details },
        { where: { student_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Student not found'));
    }
    const updatedStudent = await Student.findByPk(id);
    res.json(updatedStudent);
};

// Delete a student by ID
exports.deleteStudent = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Student.destroy({ where: { student_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Student not found'));
    }
    res.json({ message: 'Student deleted' });
};
