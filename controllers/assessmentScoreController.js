const { Student, Class, AcademicSession, Term, Subject, Result } = require('../models');
const AssessmentScore = require('../models/AssessmentScore');

// Create a new assessment score
exports.createAssessmentScore = async (req, res, next) => {
  const { result_id, assessment_id, score } = req.body;
  const assessmentScore = await AssessmentScore.create({ result_id, assessment_id, score });
  res.status(201).json(assessmentScore);
};

// Get all assessment scores
exports.getAllAssessmentScores = async (req, res, next) => {
  const assessmentScores = await AssessmentScore.findAll();
  res.status(200).json(assessmentScores);
};

// Get all results for a specific school
exports.getAssessmentScoreBySchoolId = async (req, res) => {
  const { school_id } = req.params;
  const data = await AssessmentScore.findAll({ where: { school_id } });
  if (data.length === 0) {
    return res.status(404).json({ message: 'No assessment score found for this school' });
  }
  res.json(data);
};

// Get a specific assessment score by ID
exports.getAssessmentScoreById = async (req, res, next) => {
  const { id } = req.params;
  const assessmentScore = await AssessmentScore.findByPk(id);
  if (!assessmentScore) {
    return res.status(404).json({ message: 'Assessment Score not found' });
  }
  res.status(200).json(assessmentScore);
};

// Update an existing assessment score by ID
exports.updateAssessmentScoreById = async (req, res, next) => {
  const { id } = req.params;
  const { result_id, assessment_id, score } = req.body;
  const [updated] = await AssessmentScore.update({ result_id, assessment_id, score }, {
    where: { assessment_score_id: id }
  });
  if (!updated) {
    return res.status(404).json({ message: 'Assessment Score not found' });
  }
  const updatedAssessmentScore = await AssessmentScore.findByPk(id);
  res.status(200).json(updatedAssessmentScore);
};

// Delete an assessment score by ID
exports.deleteAssessmentScoreById = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await AssessmentScore.destroy({
    where: { assessment_score_id: id }
  });
  if (!deleted) {
    return res.status(404).json({ message: 'Assessment Score not found' });
  }
  res.status(204).send();
};

exports.checkAssessmentScoreStatus = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { term_id, class_id, session_id, subject_id } = req.query;

    const whereClause = {};
    if (term_id) whereClause['$Result.term_id$'] = term_id;
    if (class_id) whereClause['$Result.class_id$'] = class_id;
    if (session_id) whereClause['$Result.session_id$'] = session_id;
    if (subject_id) whereClause['$Result.subject_id$'] = subject_id;

    const incompleteScores = await AssessmentScore.findOne({
      where: {
        ...whereClause,
        score: -1
      },
      include: [{
        model: Result,
        where: { term_id },
        include: [
          { model: Student },
          { model: Class },
          { model: AcademicSession },
          { model: Term },
          { model: Subject }
        ]
      }]
    });

    const status = !incompleteScores;

    res.json({
      status,
      message: status ? 'All assessment scores are complete.' : 'Some assessment scores are incomplete.'
    });

  } catch (error) {
    console.error('Error checking assessment score status:', error);
    res.status(500).json({ message: 'An error occurred while checking assessment score status.' });
  }
};