const Assessment = require('../models/Assessment');

// Get all assessments
exports.getAllAssessments = async (req, res, next) => {
    const assessments = await Assessment.findAll();
    res.json(assessments);
};

// Get assessments by school ID
exports.getAssessmentsBySchoolId = async (req, res, next) => {
    const school_id = req.user.school_id;
    const assessments = await Assessment.findAll({ where: { school_id } });

    res.json(assessments);
};

// Get an assessment by ID
exports.getAssessmentById = async (req, res, next) => {
    const { id } = req.params;
    const assessment = await Assessment.findByPk(id);
    if (!assessment) {
        return next(new Error('Assessment not found'));
    }
    res.json(assessment);
};

// Create a new assessment
exports.createAssessment = async (req, res, next) => {
    const school_id = req.user.school_id;
    const { assessment_name, max_score } = req.body;
    const assessment = await Assessment.create({
        school_id, assessment_name, max_score
    });
    res.status(201).json(assessment);
};

// Update an assessment by ID
exports.updateAssessment = async (req, res, next) => {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const { assessment_name, max_score } = req.body;
    const [affectedRows] = await Assessment.update(
        { school_id, assessment_name, max_score },
        { where: { assessment_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Assessment not found'));
    }
    const updatedAssessment = await Assessment.findByPk(id);
    res.json(updatedAssessment);
};

// Delete an assessment by ID
exports.deleteAssessment = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Assessment.destroy({ where: { assessment_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Assessment not found'));
    }
    res.json({ message: 'Assessment deleted' });
};
