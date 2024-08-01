const Term = require('../models/Term'); // Import your Term model

// Get all terms
exports.getAllTerms = async (req, res, next) => {
    const terms = await Term.findAll();
    res.json(terms);
};

// Route based . . .
exports.getTermsBySchoolId = async (req, res, next) => {
    const schoolId = req.user.school_id;

    const terms = await Term.findAll({ where: { school_id: schoolId } });
    if (!terms || terms.length === 0) {
        return next(new Error('No terms found for this school'));
    }
    res.json(terms);
};

// No route . . .
exports.getCurrentTermBySchoolId = async (schoolId) => {
    const currentTerm = await Term.findOne({
        where: { school_id: schoolId, current_term: true }
    });
    if (!currentTerm) {
        throw new Error('Current term not found for this school');
    }
    return currentTerm;
};

exports.getCurrentTermBySchoolFromRoute = async (req, res) => {
    const schoolId = req.user.school_id;

    const currentTerm = await Term.findOne({
        where: { school_id: schoolId, current_term: true }
    });
    if (!currentTerm) {
        throw new Error('Current term not found for this school');
    }
    res.json(currentTerm);
};

// Get a term by ID
exports.getTermById = async (req, res, next) => {
    console.log("hello")
    const { id } = req.params;
    const term = await Term.findByPk(id);
    if (!term) {
        return next(new Error('Term not found'));
    }
    res.json(term);
};

// Create a new term
exports.createTerm = async (req, res, next) => {
    const { school_id, term_name, start_date, end_date, current_term } = req.body;
    const term = await Term.create({
        school_id, term_name, start_date, end_date, current_term
    });
    res.status(201).json(term);
};

exports.setCurrentTerm = async (req, res) => {
    const { id } = req.params;
    const school_id = req.user.school_id;

    await Term.update(
        { current_term: false },
        { where: { school_id } }
    );

    await Term.update(
        { current_term: true },
        { where: { term_id: id, school_id } }
    );
    const terms = await Term.findAll({ where: { school_id } });
    const currentTerm = terms.find(session => session.current_session);

    res.json({ terms, currentTerm });
};

// Update a term by ID
exports.updateTerm = async (req, res, next) => {
    const { id } = req.params;
    const { school_id, term_name, start_date, end_date, current_term } = req.body;
    const [affectedRows] = await Term.update(
        { school_id, term_name, start_date, end_date, current_term },
        { where: { term_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Term not found'));
    }
    const updatedTerm = await Term.findByPk(id);
    res.json(updatedTerm);
};

// Delete a term by ID
exports.deleteTerm = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Term.destroy({ where: { term_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Term not found'));
    }
    res.json({ message: 'Term deleted' });
};
