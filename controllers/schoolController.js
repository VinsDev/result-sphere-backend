const School = require('../models/School');
const Term = require('../models/Term');
const Assessment = require('../models/Assessment');
const GradeRule = require('../models/GradeRule');
const jwt = require('jsonwebtoken');

const StudentEnrollmentController = require('./studentEnrollmentController');
const TeacherSubjectController = require('./teacherSubjectController');
const TermController = require('./termController');
const SessionController = require('./sessionController');
const { sendSubscriptionEmail } = require('../services/mailServices');
const UsageStatistics = require('../models/UsageStatistics');
const { AcademicSession, Class, Subject } = require('../models');

exports.checkToken = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).send('Token is valid');
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};

// Login a school
exports.loginSchool = async (req, res, next) => {
    const { email, password } = req.body;
    // Find the school by email and phone number
    const school = await School.findOne({ where: { email, password } });
    if (!school) {
        return res.status(404).json({ message: 'School not found' });
    }
    // Generate JWT token (if using JWT)
    const token = jwt.sign({ school_id: school.school_id }, 'wxyz', { expiresIn: '1d' });
    console.log(token)
    res.json({ token: token });
};

// Get all schools
exports.getAllSchools = async (req, res, next) => {
    const schools = await School.findAll();
    res.json(schools);
};

exports.getSchoolStats = async (req, res) => {
    const schoolId = req.user.school_id;

    // Parallelize the calls to the controllers
    const [studentCount, teacherCount, currentTerm, currentSession] = await Promise.all([
        StudentEnrollmentController.getStudentEnrollmentCountBySchoolId(schoolId),
        TeacherSubjectController.getTeacherSubjectCountBySchoolId(schoolId),
        TermController.getCurrentTermBySchoolId(schoolId),
        SessionController.getCurrentSessionBySchoolId(schoolId)
    ]);


    res.json({
        numberOfStudents: studentCount.count,
        numberOfTeachers: teacherCount.count,
        currentSession: currentSession,
        currentTerm: currentTerm.term_name
    });
};

exports.getSchool = async (req, res, next) => {
    const schoolId = req.user.school_id;
    const school = await School.findByPk(schoolId);
    if (!school) {
        return next(new Error('School not found'));
    }
    res.json(school);
};

exports.getShowPosition = async (req, res, next) => {
    try {
        const schoolId = req.user.school_id;
        const school = await School.findByPk(schoolId, {
            attributes: ['show_position']
        });
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }
        res.json({ show_position: school.show_position });
    } catch (error) {
        next(error);
    }
};

exports.updateShowPosition = async (req, res, next) => {
    try {
        const schoolId = req.user.school_id;
        const { show_position } = req.body;

        if (typeof show_position !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for show_position' });
        }

        const school = await School.findByPk(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }

        school.show_position = show_position;
        await school.save();

        res.json({ show_position: school.show_position });
    } catch (error) {
        next(error);
    }
};

exports.createSchool = async (req, res, next) => {
    const {
        name, email, phone_number, password, address, category, head, head_image,
        deputy1, deputy1_image, deputy2, deputy2_image, anthem, about, vision
    } = req.body;

    try {
        // Create the school
        const school = await School.create({
            name,
            email,
            phone_number,
            password,
            address,
            category,
            head,
            head_image,
            deputy1,
            deputy1_image,
            deputy2,
            deputy2_image,
            anthem,
            about,
            vision
        });

        // Create usage statistics for the new school
        await UsageStatistics.create({
            school_id: school.school_id,
            units_purchased: 0,  // Set initial values as needed
            units_left: 0,
            plan: null,  // Or set a default plan if applicable
            status: false,
        });

        // Create terms for the new school
        const terms = [
            { term_name: '1st Term', current_term: true, school_id: school.school_id },
            { term_name: '2nd Term', current_term: false, school_id: school.school_id },
            { term_name: '3rd Term', current_term: false, school_id: school.school_id }
        ];
        await Term.bulkCreate(terms);

        // Create assessments for the new school
        const assessments = [
            { assessment_name: '1st Assignment', max_score: 5, school_id: school.school_id },
            { assessment_name: '2nd Assignment', max_score: 5, school_id: school.school_id },
            { assessment_name: '1st Test', max_score: 10, school_id: school.school_id },
            { assessment_name: '2nd Test', max_score: 10, school_id: school.school_id },
            { assessment_name: 'Exams', max_score: 70, school_id: school.school_id }
        ];
        await Assessment.bulkCreate(assessments);

        // Create default grade rules for the new school
        const gradeRules = [
            { min_score: 0, max_score: 49, grade: 'F', comment: 'Fail', school_id: school.school_id },
            { min_score: 50, max_score: 59, grade: 'D', comment: 'Pass', school_id: school.school_id },
            { min_score: 60, max_score: 69, grade: 'C', comment: 'Good', school_id: school.school_id },
            { min_score: 70, max_score: 79, grade: 'B', comment: 'Very Good', school_id: school.school_id },
            { min_score: 80, max_score: 100, grade: 'A', comment: 'Excellent', school_id: school.school_id }
        ];
        await GradeRule.bulkCreate(gradeRules);

        await sendSubscriptionEmail(school.email, school.name, school.phone_number);

        res.status(201).json(school);
    } catch (error) {
        console.log(error)
        next(error);
    }
};

exports.setupStatus = async (req, res, next) => {
    const schoolId = req.user.school_id;
    try {
        const sessions = await AcademicSession.findAll({ where: { school_id: schoolId } });
        const terms = await Term.findAll({ where: { school_id: schoolId } });
        const classes = await Class.findAll({ where: { school_id: schoolId } });
        const subjects = await Subject.findAll({ where: { school_id: schoolId } });

        const hasCurrentSession = sessions.some(session => session.current_session === true);
        const hasCurrentTerm = terms.some(term => term.current_term === true);

        const statuses = {
            session: sessions.length > 0 && hasCurrentSession,
            terms: terms.length > 0 && hasCurrentTerm,
            classes: classes.length > 0,
            subjects: subjects.length > 0,
        };

        const generalStatus = Object.values(statuses).every(status => status === true);

        const response = {
            ...statuses,
            general: generalStatus
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


// Update a school by ID
exports.updateSchool = async (req, res, next) => {
    try {
        const school_id = req.user.school_id;

        const {
            name,
            email,
            phone_number,
            address,
            about,
            category,
            head,
            deputy1,
            deputy2,
            mission,
            vision,
            anthem
        } = req.body;

        // Basic input validation
        if (!name || !email || !phone_number || !address || !category || !head) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        const [affectedRows] = await School.update(
            {
                name,
                email,
                phone_number,
                address,
                about,
                category,
                head,
                deputy1,
                deputy2,
                mission,
                vision,
                anthem
            },
            { where: { school_id: school_id } }
        );

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }

        const updatedSchool = await School.findByPk(school_id);

        if (!updatedSchool) {
            return res.status(404).json({ message: 'School not found after update' });
        }

        res.json(updatedSchool);
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ message: 'An error occurred while updating the school' });
    }
};

// Delete a school by ID
exports.deleteSchool = async (req, res, next) => {
    const { id } = req.params;

    await Term.destroy({ where: { school_id: id } });
    await Assessment.destroy({ where: { school_id: id } });
    await GradeRule.destroy({ where: { school_id: id } });
    const school = await School.destroy({ where: { school_id: id } });

    // If no school was found and deleted, respond with a 404 status
    if (!school) {
        return res.status(404).json({ message: 'School not found' });
    }

    res.status(200).json({ message: 'School deleted successfully' });
};
