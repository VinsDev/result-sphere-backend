const { Term } = require('../models');
const AcademicSession = require('../models/AcademicSession');
const ResultRelease = require('../models/ResultReleases');

exports.getAllSessions = async (req, res) => {
    const sessions = await AcademicSession.findAll();
    res.json(sessions);
};

exports.getSessionsForSchool = async (req, res) => {
    const schoolId = req.user.school_id;
    const sessions = await AcademicSession.findAll({
        where: { school_id: schoolId },
        attributes: ['session_id', 'session_name', 'current_session']
    });

    res.json({
        sessions: sessions.map(session => ({
            sessionId: session.session_id,
            sessionName: session.session_name,
            currentSession: session.current_session,
        })),
        currentSession: sessions.find(s => s.current_session)?.session_name || null
    });
};

exports.getCurrentSessionBySchoolId = async (schoolId) => {
    const currentSession = await AcademicSession.findOne({
        where: { school_id: schoolId, current_session: true }
    });
    if (!currentSession) {
        return null;
    }
    return currentSession;
};

exports.getCurrentSessionBySchoolIdRoute = async (req, res) => {
    const school_id = req.user.school_id;

    const currentSession = await AcademicSession.findOne({
        where: { school_id: school_id, current_session: true }
    });
    if (!currentSession) {
        return res.json({ message: 'No current session set' });
    }
    res.json(currentSession);
};

exports.getSessionById = async (req, res) => {
    const { id } = req.params;
    const session = await AcademicSession.findByPk(id);
    if (!session) {
        return res.status(404).json({ message: 'Academic session not found' });
    }
    res.json(session);
};

exports.createSession = async (req, res) => {
    const { session_name, current_session } = req.body;
    const school_id = req.user.school_id; 

    if (!session_name) {
        return res.status(400).json({ error: 'Session name is required' });
    }

    try {
        const session = await AcademicSession.create({
            school_id,
            session_name,
            current_session: current_session || false
        });

        const terms = await Term.findAll({ where: { school_id } });
        const termIds = terms.map(term => term.term_id);

        for (const termId of termIds) {
            await ResultRelease.create({
                school_id,
                session_id: session.session_id,
                term_id: termId,
                is_published: false
            });
        }

        res.status(201).json({
            id: session.id,
            session_name: session.session_name,
            current_session: session.current_session
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSession = async (req, res) => {
    const { id } = req.params;
    const { session_name, start_date, end_date, current_session } = req.body;
    const school_id = req.user.school_id;

    if (!session_name) {
        return res.status(400).json({ error: 'Session name is required' });
    }

    const [affectedRows] = await AcademicSession.update(
        { school_id, session_name, start_date, end_date, current_session },
        { where: { session_id: id, school_id } } // Ensuring the session belongs to the school
    );

    if (affectedRows === 0) {
        return res.status(404).json({ error: 'Academic session not found' });
    }

    const updatedSession = await AcademicSession.findByPk(id);
    res.json({
        id: updatedSession.id,
        session_name: updatedSession.session_name,
        start_date: updatedSession.start_date,
        end_date: updatedSession.end_date,
        current_session: updatedSession.current_session
    });
};

exports.setCurrentSession = async (req, res) => {
    const { id } = req.params;
    const school_id = req.user.school_id; // Assuming the school_id is stored in the user object after authentication

    await AcademicSession.update(
        { current_session: false },
        { where: { school_id } }
    );

    await AcademicSession.update(
        { current_session: true },
        { where: { session_id: id, school_id } }
    );
    const sessions = await AcademicSession.findAll({ where: { school_id } });
    const currentSession = sessions.find(session => session.current_session);

    res.json({ sessions, currentSession });
};

exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    const affectedRows = await AcademicSession.destroy({ where: { session_id: id } });
    if (affectedRows === 0) {
        return res.status(404).json({ message: 'Academic session not found' });
    }
    res.json({ message: 'Academic session deleted' });
};
