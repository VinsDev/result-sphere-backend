const { Student, Subject, AssessmentScore, Result, Class, Assessment, GradeRule, StudentEnrollment, School, AcademicSession, Term } = require('../models');
const { Op } = require('sequelize');
const { getCurrentTermBySchoolId } = require('./termController');
const { getCurrentSessionBySchoolId } = require('./sessionController');
var PdfPrinter = require('pdfmake');
var Roboto = require('../fonts/Roboto');
const axios = require('axios');
const sharp = require('sharp');
const fetch = require('node-fetch');
const { htremarkHelper, position_qualifier } = require('../config/utility');


// Get all results
exports.getAllResults = async (req, res, next) => {
    const results = await Result.findAll();
    res.json(results);
};

// Get all results for a specific school
exports.getResultsBySchoolId = async (req, res) => {
    const { school_id } = req.params;
    const results = await Result.findAll({ where: { school_id } });
    if (results.length === 0) {
        return res.status(404).json({ message: 'No results found for this school' });
    }
    res.json(results);
};

// Get a result by ID
exports.getResultById = async (req, res, next) => {
    const { id } = req.params;
    const result = await Result.findByPk(id);
    if (!result) {
        return next(new Error('Result not found'));
    }
    res.json(result);
};

// Create a new result
exports.createResult = async (req, res, next) => {
    const { student_id, class_id, session_id, term_id, subject_id, total_score, grade } = req.body;
    const result = await Result.create({
        student_id, class_id, session_id, term_id, subject_id, total_score, grade
    });
    res.status(201).json(result);
};

// Update a result by ID
exports.updateResult = async (req, res, next) => {
    const { id } = req.params;
    const { student_id, class_id, session_id, term_id, subject_id, total_score, grade } = req.body;
    const [affectedRows] = await Result.update(
        { student_id, class_id, session_id, term_id, subject_id, total_score, grade },
        { where: { result_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Result not found'));
    }
    const updatedResult = await Result.findByPk(id);
    res.json(updatedResult);
};

// Delete a result by ID
exports.deleteResult = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Result.destroy({ where: { result_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Result not found'));
    }
    res.json({ message: 'Result deleted' });
};

// - - - -
exports.getStudentResults = async (req, res, next) => {
    const { student_id, class_id, session_id, term_id } = req.params;

    try {
        const results = await Result.findAll({
            where: {
                student_id,
                class_id,
                session_id,
                term_id
            },
            include: [
                {
                    model: Subject,
                    attributes: ['subject_id', 'subject_name']
                },
                {
                    model: AssessmentScore,
                    include: [{
                        model: Assessment,
                        attributes: ['assessment_id', 'assessment_name', 'max_score']
                    }]
                }
            ]
        });

        const formattedResults = results.map(result => ({
            result_id: result.result_id,
            student_id: result.student_id,
            class_id: result.class_id,
            session_id: result.session_id,
            term_id: result.term_id,
            subject_id: result.subject_id,
            subject_name: result.Subject.name,
            total_score: result.total_score,
            grade: result.grade,
            position: result.position,
            highest_score: result.highest_score,
            lowest_score: result.lowest_score,
            AssessmentScores: result.AssessmentScores.map(score => ({
                assessment_id: score.assessment_id,
                assessment_name: score.Assessment.assessment_name,
                max_score: score.Assessment.max_score,
                score: score.score
            }))
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error details:', error);
        next(error);
    }
};

exports.computeResults = async (req, res, next) => {
    try {
        const school_id = req.user.school_id;

        const current_term = await getCurrentTermBySchoolId(school_id);
        const current_session = await getCurrentSessionBySchoolId(school_id);

        if (!current_term || !current_session) {
            return res.status(400).json({ message: 'Current term or session not set for the school' });
        }

        // Get all grade rules for this school
        const gradeRules = await GradeRule.findAll({ where: { school_id } });

        // Function to determine grade based on score and grade rules
        const determineGrade = (score) => {
            for (const rule of gradeRules) {
                if (score >= rule.min_score && score <= rule.max_score) {
                    return { grade: rule.grade, comment: rule.comment };
                }
            }
            return { grade: 'N/A', comment: 'Score out of range' };
        };

        // Get all classes in the school
        const classes = await Class.findAll({ where: { school_id } });

        const computedResults = [];

        // Process each class
        for (const class_item of classes) {
            // Get all students in the class
            const students = await StudentEnrollment.findAll({
                where: {
                    class_id: class_item.class_id,
                    term_id: current_term.term_id,
                    session_id: current_session.session_id
                }
            });

            // Get all subjects for the class
            const subjects = await Subject.findAll({ where: { class_id: class_item.class_id } });

            // Get all assessments for this school
            const assessments = await Assessment.findAll({ where: { school_id } });

            // Initialize subject score trackers
            const subjectScores = {};
            subjects.forEach(subject => {
                subjectScores[subject.subject_id] = {
                    highestScore: -Infinity,
                    lowestScore: Infinity,
                    totalScores: [],
                    results: []
                };
            });

            // Process each student
            for (const enrollment of students) {
                let studentTotalScore = 0;
                let studentSubjectCount = 0;

                // Process each subject for the student
                for (const subject of subjects) {
                    const [result, created] = await Result.findOrCreate({
                        where: {
                            student_id: enrollment.student_id,
                            subject_id: subject.subject_id,
                            class_id: class_item.class_id,
                            term_id: current_term.term_id,
                            session_id: current_session.session_id
                        },
                        defaults: { total_score: 0, grade: 'N/A', comment: '', position: null, highest_score: 0, lowest_score: 0 }
                    });

                    // Get all assessment scores for this result
                    const assessmentScores = await AssessmentScore.findAll({
                        where: {
                            result_id: result.result_id,
                            assessment_id: { [Op.in]: assessments.map(a => a.assessment_id) }
                        }
                    });

                    // Compute total score for the subject
                    const subjectTotalScore = assessmentScores.reduce((sum, score) => sum + Math.max(score.score, 0), 0);

                    // Update subject score trackers
                    subjectScores[subject.subject_id].highestScore = Math.max(subjectScores[subject.subject_id].highestScore, subjectTotalScore);
                    subjectScores[subject.subject_id].lowestScore = Math.min(subjectScores[subject.subject_id].lowestScore, subjectTotalScore);
                    subjectScores[subject.subject_id].totalScores.push(subjectTotalScore);
                    subjectScores[subject.subject_id].results.push({ result_id: result.result_id, total_score: subjectTotalScore });

                    // Determine grade for this subject
                    const { grade, comment } = determineGrade(subjectTotalScore);

                    // Update the result
                    await result.update({
                        total_score: subjectTotalScore,
                        grade: grade,
                        comment: comment
                    });

                    studentTotalScore += subjectTotalScore;
                    studentSubjectCount++;
                }

                // Calculate average score for the student
                const studentAverageScore = studentSubjectCount > 0 ? studentTotalScore / studentSubjectCount : 0;

                // Store computed result for further processing
                computedResults.push({
                    enrollment_id: enrollment.enrollment_id,
                    student_id: enrollment.student_id,
                    class_id: class_item.class_id,
                    total_score: studentTotalScore,
                    average: studentAverageScore
                });

                // Update StudentEnrollment with total and average
                await enrollment.update({
                    total: studentTotalScore,
                    average: studentAverageScore
                });
            }

            // Update highest and lowest scores, compute positions and averages for each subject
            for (const subject of subjects) {
                const subjectData = subjectScores[subject.subject_id];

                // Update highest and lowest scores
                await Result.update(
                    {
                        highest_score: subjectData.highestScore,
                        lowest_score: subjectData.lowestScore
                    },
                    {
                        where: {
                            subject_id: subject.subject_id,
                            class_id: class_item.class_id,
                            term_id: current_term.term_id,
                            session_id: current_session.session_id
                        }
                    }
                );

                // Compute positions for this subject
                subjectData.results.sort((a, b) => b.total_score - a.total_score);
                let totalScore = 0;
                for (let i = 0; i < subjectData.results.length; i++) {
                    const position = i + 1;
                    const result = subjectData.results[i];
                    totalScore += result.total_score;

                    await Result.update(
                        { position: position },
                        { where: { result_id: result.result_id } }
                    );
                }

                // Compute and update subject average
                const average = subjectData.results.length > 0 ? totalScore / subjectData.results.length : 0;
                await Subject.update(
                    { average: average },
                    { where: { subject_id: subject.subject_id } }
                );
            }

            // Compute overall positions based on average scores
            computedResults
                .filter(result => result.class_id === class_item.class_id)
                .sort((a, b) => b.average - a.average)
                .forEach((result, index) => {
                    const position = index + 1;
                    StudentEnrollment.update(
                        { position: position },
                        {
                            where: {
                                enrollment_id: result.enrollment_id
                            }
                        }
                    );
                    // Update the computedResults with position
                    result.position = position;
                });
        }

        res.json({ message: 'Results computed successfully', results: computedResults });
    } catch (error) {
        console.error('Error computing results:', error);
        next(error);
    }
};


async function getImageBuffer(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resizedBuffer = await sharp(buffer)
            .resize(200)
            .png()
            .toBuffer();

        return resizedBuffer;
    } catch (error) {
        console.error('Error fetching or processing image:', error);
        throw error;
    }
}

// async function getImageBuffer(url) {
//     try {
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         const buffer = Buffer.from(response.data, 'binary');

//         // Resize and convert to PNG (pdfmake works well with PNGs)
//         const resizedBuffer = await sharp(buffer)
//             .resize(200) // Adjust size as needed
//             .png()
//             .toBuffer();

//         return resizedBuffer;
//     } catch (error) {
//         console.error('Error fetching or processing image:', error);
//         throw error;
//     }
// }

exports.generateStudentResultPDF = async (req, res) => {
    try {
        const { student_id, class_id, session_id, term_id } = req.params;

        // Fetch necessary data (adjust these queries based on your data structure)
        const student = await Student.findByPk(student_id);
        const enrollment = await StudentEnrollment.findOne({
            where: { student_id: student_id, class_id: class_id, session_id: session_id, term_id: term_id }
        });

        const studentsCount = await StudentEnrollment.count({
            where: { class_id: class_id, session_id: session_id, term_id: term_id }
        });

        const schoolInfo = await School.findByPk(enrollment.school_id);

        const logoBuffer = await getImageBuffer(schoolInfo.logo);
        const stampBuffer = await getImageBuffer(schoolInfo.school_stamp);

        const assessments = await Assessment.findAll({
            where: { school_id: enrollment.school_id },
            order: [['assessment_id', 'ASC']]
        });

        const results = await Result.findAll({
            where: { student_id: student_id, class_id: class_id, session_id: session_id, term_id: term_id },
            include: [
                { model: Subject },
                { model: AssessmentScore, include: [{ model: Assessment }] }
            ]
        });
        const classInfo = await Class.findByPk(class_id);
        const sessionInfo = await AcademicSession.findByPk(session_id);
        const termInfo = await Term.findByPk(term_id);

        // Prepare table data
        let tableItems = [
            [
                { rowSpan: 2, text: 'Subjects', alignment: 'center', style: 'tableHeader' },
                { text: 'C. Assessments', style: 'tableHeader', colSpan: assessments.length, alignment: 'center' },
                ...Array(assessments.length - 1).fill({}),
                { text: 'Total', style: 'tableHeader', alignment: 'center' },
                { text: 'Average', style: 'tableHeader', alignment: 'center' },
                { text: 'Highest', style: 'tableHeader', alignment: 'center' },
                { text: 'Lowest', style: 'tableHeader', alignment: 'center' },
                { text: 'Rank', style: 'tableHeader', alignment: 'center' },
                { text: 'Grade', style: 'tableHeader', alignment: 'center' }
            ],
            [
                '',
                ...assessments.map(assessment => ({ text: assessment.assessment_name, style: 'tableHeader', alignment: 'center' })),
                '', '', '', '', '', ''
            ],
        ];

        results.forEach(result => {
            let row = [
                { text: result.Subject.subject_name ?? '-', style: 'tableHeader' },
            ];

            // Add scores for each assessment
            assessments.forEach(assessment => {
                const score = result.AssessmentScores.find(s => s.Assessment.assessment_id === assessment.assessment_id);
                row.push({ text: score ? score.score : '-', style: 'tableHeader', alignment: 'center' });
            });

            // Add the rest of the columns
            row.push(
                { text: result.total_score ?? '-', style: 'tableHeader', alignment: 'center' },
                { text: result.Subject.average ?? '-', style: 'tableHeader', alignment: 'center' },
                { text: result.highest_score ?? '-', style: 'tableHeader', alignment: 'center' },
                { text: result.lowest_score ?? '-', style: 'tableHeader', alignment: 'center' },
                { text: result.position ?? '-', style: 'tableHeader', alignment: 'center' },
                { text: result.grade ?? '-', style: 'tableHeader', alignment: 'center' }
            );

            tableItems.push(row);
        });

        // Prepare document definition
        const docDefinition = {
            content: [
                schoolInfo.logo !== null ? {
                    image: logoBuffer,
                    fit: [60, 60],
                    alignment: 'center',
                } : {},
                {
                    text: schoolInfo.name,
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: schoolInfo.address,
                    style: 'subheader',
                    alignment: 'center'
                },
                {
                    columns: [
                        { width: '*', text: `Name of Student: ${student.full_name}`, style: 'top' },
                        { width: 'auto', text: `Session: ${sessionInfo.session_name}`, style: 'top' },
                    ]
                },
                {
                    columns: [
                        { width: '*', text: `School: ${schoolInfo.name}`, style: 'top' },
                        { width: 'auto', text: `Sex: ${student.gender}`, style: 'top' },
                    ]
                },
                {
                    columns: [
                        { width: '*', text: `Term: ${termInfo.term_name}`, style: 'top' },
                        { width: 'auto', text: `Date of Birth: ${student.date_of_birth}`, style: 'top' },
                    ]
                },
                {
                    columns: [
                        { width: '*', text: `Class: ${classInfo.class_name}`, style: 'top' },
                        { width: 'auto', text: `Number in Class: ${studentsCount}`, style: 'top' },
                    ]
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: [
                            '*',
                            ...Array(assessments.length).fill('auto'),
                            'auto', 'auto', 'auto', 'auto', 'auto', 'auto'
                        ],
                        body: tableItems
                    }
                },
                {
                    columns: [
                        { width: '*', text: `NUMBER OF SUBJECTS: ${results.length}`, style: 'bottom' },
                        { width: '*', text: `TOTAL OBTAINABLE MARKS: ${results.length * 100}`, style: 'bottom' },
                        { width: 'auto', text: `MARKS OBTAINED: ${enrollment.total}`, style: 'bottom' },
                    ]
                },
                {
                    columns: [
                        { width: '*', text: `CLASS AVERAGE: ${enrollment.average}`, style: 'bottom' },
                        { width: '*', text: `POSITION IN CLASS: ${position_qualifier(enrollment.position)}`, style: 'bottom' },
                        { width: 'auto', text: `OUT OF CLASS: ${studentsCount}`, style: 'bottom' },
                    ]
                },
                {
                    text: `PRINCIPAL'S REMARKS: ${htremarkHelper(enrollment.average)}`,
                    style: 'bottom',
                },
                {
                    columns: [
                        { width: '*', text: `NAME OF PRINCIPAL: ${schoolInfo.head}`, style: 'bottom' },
                        { width: 'auto', text: 'SIGNATURE/STAMP:', style: 'bottom' },
                        schoolInfo.school_stamp !== null ? { width: 'auto', image: stampBuffer, fit: [40, 40] } : {},
                        { width: 'auto', text: `DATE: ${new Date().toISOString().split('T')[0]}`, style: 'bottom' },
                    ]
                },
            ],
            styles: {
                header: { fontSize: 15, bold: true, margin: [0, 5, 0, 3] },
                subheader: { fontSize: 13, bold: true, margin: [0, 0, 0, 10] },
                top: { bold: true, fontSize: 11, color: 'black', margin: [0, 0, 0, 5] },
                bottom: { bold: false, fontSize: 10, color: 'black', margin: [0, 5, 0, 0] },
                tableHeader: { bold: true, fontSize: 9.5, color: 'black' }
            },
            defaultStyle: { font: 'Roboto' }
        };

        // Generate PDF
        var printer = new PdfPrinter(Roboto);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Result_${student.full_name}.pdf`);

        // Pipe the PDF document to the response
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
};

exports.generateMasterScoreSheet = async (req, res) => {
    try {
        const { class_id, session_id, term_id } = req.params;

        // Fetch necessary data
        const classInfo = await Class.findByPk(class_id, { include: School });
        const sessionInfo = await AcademicSession.findByPk(session_id);
        const termInfo = await Term.findByPk(term_id);

        if (!classInfo || !sessionInfo || !termInfo) {
            throw new Error('Required information not found');
        }

        // Fetch all students in the class for this term and session
        const enrollments = await StudentEnrollment.findAll({
            where: { class_id, session_id, term_id },
            include: [
                {
                    model: Student,
                    include: [{
                        model: Result,
                        where: { class_id, session_id, term_id },
                        include: [
                            { model: Subject },
                            { model: AssessmentScore, include: [Assessment] }
                        ],
                        required: false
                    }]
                },
                { model: Class },
                { model: AcademicSession },
                { model: Term }
            ],
            order: [['position', 'ASC']]
        });

        if (enrollments.length === 0) {
            throw new Error('No enrollments found for the specified class, session, and term');
        }

        // Get all unique subjects
        const allSubjects = [...new Set(enrollments.flatMap(enrollment =>
            enrollment.Student.Results.map(result => result.Subject.subject_name)
        ))];

        // Prepare table headers
        const tableHeaders = [
            [
                { text: 'S/N', style: 'tableHeader', alignment: 'center' },
                { text: 'Student Name', style: 'tableHeader', alignment: 'center' },
                ...allSubjects.map(subject => ({ text: subject, style: 'tableHeader', alignment: 'center' })),
                { text: 'Total', style: 'tableHeader', alignment: 'center' },
                { text: 'Avg', style: 'tableHeader', alignment: 'center' },
                { text: 'Pos', style: 'tableHeader', alignment: 'center' }
            ]
        ];

        // Prepare table body
        const tableBody = enrollments.map((enrollment, index) => {
            const row = [
                { text: index + 1, alignment: 'center' },
                { text: enrollment.Student.full_name, alignment: 'left' }
            ];

            // Add subject scores
            allSubjects.forEach(subject => {
                const result = enrollment.Student.Results.find(r => r.Subject.subject_name === subject);
                row.push({ text: result ? result.total_score : '-', alignment: 'center' });
            });

            // Add total score, average, and position
            row.push(
                { text: enrollment.total ? enrollment.total : '-', alignment: 'center' },
                { text: enrollment.average ? enrollment.average : '-', alignment: 'center' },
                { text: enrollment.position ? enrollment.position : '-', alignment: 'center' }
            );

            return row;
        });

        // Combine headers and body
        const tableItems = [...tableHeaders, ...tableBody];

        // Calculate dynamic column widths
        const columnWidths = ['auto', 'auto', ...Array(allSubjects.length).fill('auto'), 'auto', 'auto', 'auto'];

        // Create document definition
        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [10, 20, 10, 20],
            content: [
                { text: classInfo.School.name, style: 'header', alignment: 'center' },
                { text: `Master Score Sheet - ${classInfo.class_name}`, style: 'subheader', alignment: 'center' },
                { text: `${sessionInfo.session_name} - ${termInfo.term_name}`, style: 'subheader', alignment: 'center' },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: columnWidths,
                        body: tableItems
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                header: { fontSize: 14, bold: true, margin: [0, 0, 0, 5] },
                subheader: { fontSize: 12, bold: true, margin: [0, 5, 0, 3] },
                tableExample: { margin: [0, 5, 0, 10] },
                tableHeader: { bold: true, fontSize: 8, color: 'black' }
            },
            defaultStyle: { fontSize: 7, font: 'Roboto' },
            footer: function (currentPage, pageCount) {
                return { text: currentPage + ' of ' + pageCount, alignment: 'center' };
            }
        };

        // Generate PDF
        var printer = new PdfPrinter(Roboto);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Master_Score_Sheet_${classInfo.class_name}.pdf`);

        // Pipe the PDF document to the response
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (error) {
        console.error('Error generating master score sheet:', error);
        res.status(500).json({ message: 'Error generating master score sheet', error: error.message });
    }
};