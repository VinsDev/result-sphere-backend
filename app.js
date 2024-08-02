require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Import middleware
const errorMiddleware = require('./middlewares/errorMiddleware');
const loggerMiddleware = require('./middlewares/loggerMiddleware'); // If using logging

const models = require('./models');
// Import routes
const schoolRoutes = require('./routes/schoolRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const teacherSubjectRoutes = require('./routes/teacherSubjectRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const termRoutes = require('./routes/termRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const studentEnrollmentRoutes = require('./routes/studentEnrollmentRoutes');
const resultRoutes = require('./routes/resultRoutes');
const resultReleasesRoutes = require('./routes/resultReleasesRoutes');
const assessmentScoreRoutes = require('./routes/assessmentScoreRoutes');
const gradeRuleRoutes = require('./routes/gradeRuleRoutes');
const usageStatsRoutes = require('./routes/usageStatsRoutes');
const dbRouter = require('./routes/dbRouter');

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(loggerMiddleware);
app.use(errorMiddleware);

// Use routes
app.use('/schools', schoolRoutes);
app.use('/terms', termRoutes);
app.use('/assessments', assessmentRoutes);
app.use('/sessions', sessionRoutes);
app.use('/teachers', teacherRoutes);
app.use('/teacher-subjects', teacherSubjectRoutes);
app.use('/students', studentRoutes);
app.use('/classes', classRoutes);
app.use('/subjects', subjectRoutes);
app.use('/student-enrollments', studentEnrollmentRoutes);
app.use('/results', resultRoutes);
app.use('/result-releases', resultReleasesRoutes);
app.use('/assessment-scores', assessmentScoreRoutes);
app.use('/grade-rules', gradeRuleRoutes);
app.use('/grade-rules', gradeRuleRoutes);
app.use('/usage-stats', usageStatsRoutes);
app.use('/db', dbRouter);

app.get('/health', (req, res) => {
    res.send({ message: "Server active . . ." });
});


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Optionally restart the process or take other actions
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally restart the process or take other actions
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
