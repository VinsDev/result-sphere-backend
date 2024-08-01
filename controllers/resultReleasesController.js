const { ResultReleases, School, AcademicSession, Term } = require('../models');

// Get all result releases
exports.getAllResultReleases = async (req, res, next) => {
    try {
        const resultReleases = await ResultReleases.findAll();
        res.json(resultReleases);
    } catch (error) {
        console.error('Error fetching result releases:', error);
        next(error);
    }
};

// Get all result releases for a specific school
exports.getAllResultReleasesBySchool = async (req, res, next) => {
    const school_id = req.user.school_id;
    try {
        const resultReleases = await ResultReleases.findAll({ where: { school_id } });

        if (!resultReleases) {
            return res.status(404).json({ message: 'No result releases found for this school' });
        }

        res.json(resultReleases);
    } catch (error) {
        console.error('Error fetching result releases for school:', error);
        next(error);
    }
};

// Get current result releases for a specific school
exports.getCurrentResultReleasesBySchool = async (req, res, next) => {
    const school_id = req.user.school_id;
    try {
        const currentTerm = await Term.findOne({ where: { school_id: school_id, current_term: true, } })
        const currentSession = await AcademicSession.findOne({ where: { school_id: school_id, current_session: true, } })

        const resultReleases = await ResultReleases.findOne({ where: { school_id, term_id: currentTerm.term_id, session_id: currentSession.session_id } });

        if (!resultReleases) {
            return res.status(404).json({ message: 'No result releases found for this school' });
        }

        res.json(resultReleases);
    } catch (error) {
        console.error('Error fetching result releases for school:', error);
        next(error);
    }
};

// Get a result release by ID
exports.getResultReleaseById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const resultRelease = await ResultReleases.findByPk(id);
        if (!resultRelease) {
            return res.status(404).json({ message: 'Result release not found' });
        }
        res.json(resultRelease);
    } catch (error) {
        console.error('Error fetching result release:', error);
        next(error);
    }
};

// Create a new result release
exports.createResultRelease = async (req, res, next) => {
    const { school_id, session_id, term_id, release_date, is_published } = req.body;
    try {
        const resultRelease = await ResultReleases.create({
            school_id,
            session_id,
            term_id,
            release_date,
            is_published
        });
        res.status(201).json(resultRelease);
    } catch (error) {
        console.error('Error creating result release:', error);
        next(error);
    }
};

// Update a result release by ID
exports.updateResultRelease = async (req, res, next) => {
    const { id } = req.params;
    const { school_id, session_id, term_id, release_date, is_published } = req.body;
    try {
        const [affectedRows] = await ResultReleases.update(
            { school_id, session_id, term_id, release_date, is_published },
            { where: { release_id: id } }
        );
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Result release not found' });
        }
        const updatedResultRelease = await ResultReleases.findByPk(id);
        res.json(updatedResultRelease);
    } catch (error) {
        console.error('Error updating result release:', error);
        next(error);
    }
};

// Toggle a result release by ID
exports.toggleResultRelease = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Find the result release by ID
        const resultRelease = await ResultReleases.findByPk(id);
        if (!resultRelease) {
            return res.status(404).json({ message: 'Result release not found' });
        }

        // Toggle the is_published field
        const updatedResultRelease = await resultRelease.update({
            is_published: !resultRelease.is_published
        });

        res.json(updatedResultRelease);
    } catch (error) {
        console.error('Error updating result release:', error);
        next(error);
    }
};


// Delete a result release by ID
exports.deleteResultRelease = async (req, res, next) => {
    const { id } = req.params;
    try {
        const affectedRows = await ResultReleases.destroy({ where: { release_id: id } });
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Result release not found' });
        }
        res.json({ message: 'Result release deleted' });
    } catch (error) {
        console.error('Error deleting result release:', error);
        next(error);
    }
};

// Get result releases for a specific term and session
exports.getResultReleasesByTermAndSession = async (req, res, next) => {
    const { term_id, session_id } = req.params;
    try {
        const resultReleases = await ResultReleases.findAll({ where: { term_id, session_id } });
        if (resultReleases.length === 0) {
            return res.status(404).json({ message: 'No result releases found for this term and session' });
        }
        res.json(resultReleases);
    } catch (error) {
        console.error('Error fetching result releases for term and session:', error);
        next(error);
    }
};
