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
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

exports.checkEmailSchoolAssociation = async (req, res, next) => {
    try {
        // Get the email from the query parameters
        const { email } = req.query;

        // Validate email format
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Query to check if the email is associated with a school
        const school = await School.findOne({ where: { email } });

        // Respond with the result
        if (school) {
            res.json({ exists: true, school: school.name });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking email association:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.searchSchools = async (req, res, next) => {
    try {
        const { q } = req.query; // Get the 'q' query parameter from the request
        let schools;

        if (q) {
            // If 'q' is provided, find schools with matching names
            schools = await School.findAll({
                where: {
                    name: {
                        [Op.like]: `%${q}%` // Use LIKE operator for partial matching
                    }
                }
            });
        } else {
            // If no 'q' is provided, return all schools
            schools = await School.findAll();
        }
        res.json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching schools.' });
    }
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

exports.getSchoolById = async (req, res, next) => {
    const { school_id } = req.params;
    const school = await School.findByPk(school_id);
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
        name, email, phone_number, password, address, category, head,
        deputy1, deputy2, anthem, about, vision
    } = req.body;

    try {
        const uploadFile = async (file, folder) => {
            if (file) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, { folder });
                    return result.secure_url;
                } catch (error) {
                    console.error(`Error uploading to ${folder}:`, error);
                    throw error;
                }
            }
            return null;
        };

        const headImageUrl = await uploadFile(req.files.head_image?.[0], 'head-image');
        const deputy1ImageUrl = await uploadFile(req.files.deputy1_image?.[0], 'deputy1-image');
        const deputy2ImageUrl = await uploadFile(req.files.deputy2_image?.[0], 'deputy2-image');
        const logoUrl = await uploadFile(req.files.logo?.[0], 'logo');
        const schoolImageUrl = await uploadFile(req.files.school_image?.[0], 'school-image');

        const school = await School.create({
            name,
            email,
            phone_number,
            password,
            address,
            category,
            head,
            head_image: headImageUrl,
            deputy1,
            deputy1_image: deputy1ImageUrl,
            deputy2, 
            deputy2_image: deputy2ImageUrl,
            anthem,
            about,
            vision,
            school_image: schoolImageUrl,
            logo: logoUrl
        });

        // Create usage statistics for the new school
        await UsageStatistics.create({
            school_id: school.school_id,
            units_purchased: 0,
            units_left: 500,
            plan: 'Starter',
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

        await sendSubscriptionEmail(school.school_id, school.email, school.name, school.phone_number, school.password);

        res.status(201).json(school);
    } catch (error) {
        console.log(error)
        next(error);
    }
};

exports.purchaseUnits = async (req, res, next) => {
    const { units, cost, plan, paymentReference } = req.body;
    const schoolId = req.user.school_id; // Assuming you have middleware that sets the user

    try {
        // Start a transaction

        try {
            // Fetch the current usage statistics
            const usageStats = await UsageStatistics.findOne({
                where: { school_id: schoolId }
            });

            if (!usageStats) {
                throw new Error('Usage statistics not found for this school');
            }

            // Update the usage statistics
            const updatedUnits = usageStats.units_left + units;
            await usageStats.update({
                units_purchased: usageStats.units_purchased + units,
                units_left: updatedUnits,
                plan: plan,
                status: true, // Assuming the purchase activates the account
            });

            // Send a confirmation email
            // await sendPurchaseConfirmationEmail(schoolId, units, cost, plan);

            res.status(200).json({ message: 'Units purchased successfully' });
        } catch (error) {
            // If there's an error, roll back the transaction
            throw error;
        }
    } catch (error) {
        console.error('Error in purchaseUnits:', error);
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

        const uploadFile = async (file, folder) => {
            if (file) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, { folder });
                    return result.secure_url;
                } catch (error) {
                    console.error(`Error uploading to ${folder}:`, error);
                    throw error;
                }
            }
            return null;
        };

        const updateData = {
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
        };

        // Only update image fields if new files were uploaded
        if (req.files.head_image?.[0]) {
            updateData.head_image = await uploadFile(req.files.head_image[0], 'head-image');
        }
        if (req.files.deputy1_image?.[0]) {
            updateData.deputy1_image = await uploadFile(req.files.deputy1_image[0], 'deputy1-image');
        }
        if (req.files.deputy2_image?.[0]) {
            updateData.deputy2_image = await uploadFile(req.files.deputy2_image[0], 'deputy2-image');
        }
        if (req.files.logo?.[0]) {
            updateData.logo = await uploadFile(req.files.logo[0], 'logo');
        }
        if (req.files.school_image?.[0]) {
            updateData.school_image = await uploadFile(req.files.school_image[0], 'school-image');
        }
        if (req.files.school_stamp?.[0]) {
            updateData.school_stamp = await uploadFile(req.files.school_stamp[0], 'school-stamp');
        }

        const [affectedRows] = await School.update(
            updateData,
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
