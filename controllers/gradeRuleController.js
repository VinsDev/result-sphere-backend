const GradeRule = require('../models/GradeRule');

// Get all grade rules
exports.getAllGradeRules = async (req, res, next) => {
    const gradeRules = await GradeRule.findAll();
    res.json(gradeRules);
};

// Get a grade rule by ID
exports.getGradeRuleById = async (req, res, next) => {
    const { id } = req.params;
    const gradeRule = await GradeRule.findByPk(id);
    if (!gradeRule) {
        return next(new Error('Grade rule not found'));
    }
    res.json(gradeRule);
};

// Get grade rules by school ID
exports.getGradeRulesBySchoolId = async (req, res, next) => {
    const schoolId = req.user.school_id;
    const gradeRules = await GradeRule.findAll({ where: { school_id: schoolId } });
    res.json(gradeRules);
};

// Create a new grade rule
exports.createGradeRule = async (req, res, next) => {
    const school_id = req.user.school_id;
    const { min_score, max_score, grade, comment } = req.body;
    const gradeRule = await GradeRule.create({
        school_id, min_score, max_score, grade, comment
    });
    res.status(201).json(gradeRule);
};

// Update a grade rule by ID
exports.updateGradeRule = async (req, res, next) => {
    const { id } = req.params;
    const school_id = req.user.school_id;
    const { min_score, max_score, grade, comment } = req.body;
    const [affectedRows] = await GradeRule.update(
        { school_id, min_score, max_score, grade, comment },
        { where: { grade_rule_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Grade rule not found'));
    }
    const updatedGradeRule = await GradeRule.findByPk(id);
    res.json(updatedGradeRule);
};

// Delete a grade rule by ID
exports.deleteGradeRule = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await GradeRule.destroy({ where: { grade_rule_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Grade rule not found'));
    }
    res.json({ message: 'Grade rule deleted' });
};
