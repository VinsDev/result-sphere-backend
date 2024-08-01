const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for Academic Sessions
router.get('/', sessionController.getAllSessions);
router.get('/school', authMiddleware, sessionController.getSessionsForSchool);
router.get('/current', authMiddleware, sessionController.getCurrentSessionBySchoolIdRoute);
router.get('/:id', sessionController.getSessionById);
router.post('/', authMiddleware, sessionController.createSession);
router.put('/:id', authMiddleware, sessionController.updateSession);
router.put('/set-current/:id', authMiddleware, sessionController.setCurrentSession);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
