const sequelize = require('../config/database');

const Assessment = require('../models/Assessment');
const AssessmentScore = require('../models/AssessmentScore');
const Result = require('../models/Result');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// Get all subjects
exports.getAllSubjects = async (req, res, next) => {
    const subjects = await Subject.findAll();
    res.json(subjects);
};

// Get all subjects for a specific school
exports.getSubjectsBySchoolId = async (req, res) => {
    const school_id = req.user.school_id;
    const { class_id, term_id } = req.query;

    const whereClause = { school_id };
    if (class_id) {
        whereClause.class_id = class_id;
    }

    if (term_id) {
        whereClause.term_id = term_id;
    }

    const subjects = await Subject.findAll({ where: whereClause });

    res.json(subjects);
};


// Get a subject by ID
exports.getSubjectById = async (req, res, next) => {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    if (!subject) {
        return next(new Error('Subject not found'));
    }
    res.json(subject);
};

// Create a new subject
exports.createSubject = async (req, res, next) => {
    const school_id = req.user.school_id;
    const { teacher_id, subject_name, class_id, term_id } = req.body;
    const subject = await Subject.create({
        school_id, teacher_id, subject_name, class_id, term_id
    });
    res.status(201).json(subject);
};

// Update a subject by ID
exports.updateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { subject_name, term_id, class_id } = req.body;

        // Create an object with only the provided fields
        const updateFields = {};
        if (subject_name !== undefined) updateFields.subject_name = subject_name;
        if (term_id !== undefined) updateFields.term_id = term_id;
        if (class_id !== undefined) updateFields.class_id = class_id;

        // If no fields to update, return early
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        const [affectedRows] = await Subject.update(
            updateFields,
            { where: { subject_id: id } }
        );

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Subject not found or no changes made' });
        }

        const updatedSubject = await Subject.findByPk(id);
        res.json(updatedSubject);
    } catch (error) {
        console.error('Error updating subject:', error);
        next(error);
    }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Subject.destroy({ where: { subject_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Subject not found'));
    }
    res.json({ message: 'Subject deleted' });
};

exports.getAssessmentScoresForSubject = async (req, res, next) => {
    const { subject_id, class_id, term_id, session_id } = req.params;

    try {
        const scores = await Result.findAll({
            where: {
                subject_id,
                class_id,
                term_id,
                session_id
            },
            include: [
                {
                    model: Student,
                    attributes: ['student_id', 'full_name', 'admission_number']
                },
                {
                    model: AssessmentScore,
                    include: [{
                        model: Assessment,
                        attributes: ['assessment_id', 'assessment_name']
                    }]
                }
            ]
        });

        res.status(200).json(scores);
    } catch (error) {
        next(error);
    }
};

exports.updateAssessmentScores = async (req, res, next) => {
    const { subject_id, class_id, term_id, session_id } = req.params;
    const { scores } = req.body;

    try {
        // Start a transaction
        await sequelize.transaction(async (t) => {
            for (const score of scores) {
                const { result_id, assessment_id, new_score } = score;

                // Find the existing AssessmentScore
                const assessmentScore = await AssessmentScore.findOne({
                    where: {
                        result_id,
                        '$Result.subject_id$': subject_id,
                        '$Result.class_id$': class_id,
                        '$Result.term_id$': term_id,
                        '$Result.session_id$': session_id,
                        assessment_id
                    },
                    include: [{
                        model: Result,
                        attributes: []
                    }]
                }, { transaction: t });

                if (!assessmentScore) {
                    throw new Error(`AssessmentScore not found for result_id: ${result_id}, assessment_id: ${assessment_id}`);
                }

                // Update the score
                await assessmentScore.update({ score: new_score }, { transaction: t });
            }
        });

        res.status(200).json({ message: 'Scores updated successfully' });
    } catch (error) {
        next(error);
    }
};