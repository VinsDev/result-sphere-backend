const mysql = require('mysql2/promise');
const express = require('express');
const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Controller function
async function initializeDatabase(req, res) {
  const connection = await pool.getConnection();

  try {
    // Drop existing tables
    const dropTables = `
      DROP TABLE IF EXISTS AssessmentScores;
      DROP TABLE IF EXISTS Assessments;
      DROP TABLE IF EXISTS GradeRules;
      DROP TABLE IF EXISTS Results;
      DROP TABLE IF EXISTS StudentEnrollments;
      DROP TABLE IF EXISTS Students;
      DROP TABLE IF EXISTS TeacherSubjects;
      DROP TABLE IF EXISTS Teachers;
      DROP TABLE IF EXISTS Subjects;
      DROP TABLE IF EXISTS Classes;
      DROP TABLE IF EXISTS ResultReleases;
      DROP TABLE IF EXISTS Terms;
      DROP TABLE IF EXISTS AcademicSessions;
      DROP TABLE IF EXISTS UsageStatistics;
      DROP TABLE IF EXISTS Schools;
    `;

    // Create tables
    const createSchoolTable = `
    CREATE TABLE IF NOT EXISTS Schools (
      school_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone_number VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      category VARCHAR(255) NOT NULL,
      head VARCHAR(255) NOT NULL,
      head_image VARCHAR(255),
      deputy1 VARCHAR(255) NOT NULL,
      deputy1_image VARCHAR(255),
      deputy2 VARCHAR(255),
      deputy2_image VARCHAR(255),
      anthem TEXT NOT NULL,
      about TEXT NOT NULL,
      vision TEXT NOT NULL,
      show_position BOOLEAN NOT NULL DEFAULT false,
      logo VARCHAR(255),
      school_image VARCHAR(255),
      school_stamp VARCHAR(255)
    );
  `;

    const createUsageStatisticsTable = `
    CREATE TABLE IF NOT EXISTS UsageStatistics (
      school_id INT PRIMARY KEY,
      units_purchased INT NOT NULL,
      units_left INT NOT NULL,
      plan VARCHAR(255),
      status BOOLEAN NOT NULL DEFAULT FALSE,
      usage_percentage DECIMAL(5, 2) DEFAULT 0,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE
    );
  `;

    const createAcademicSessionsTable = `
    CREATE TABLE IF NOT EXISTS AcademicSessions (
      session_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT NOT NULL,
      session_name VARCHAR(255) NOT NULL,
      start_date DATE,
      end_date DATE,
      current_session BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE
    );
  `;

    const createTermsTable = `
    CREATE TABLE IF NOT EXISTS Terms (
      term_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT NOT NULL,
      term_name VARCHAR(255) NOT NULL,
      start_date DATE,
      end_date DATE,
      current_term BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE
    );
  `;

    const createResultReleasesTable = `
    CREATE TABLE IF NOT EXISTS ResultReleases (
      release_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT NOT NULL,
      session_id INT NOT NULL,
      term_id INT NOT NULL,
      is_published BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES AcademicSessions(session_id) ON DELETE CASCADE,
      FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE
    );
  `;

    const createClassesTable = `
    CREATE TABLE IF NOT EXISTS Classes (
      class_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT NOT NULL,
      class_name VARCHAR(255) NOT NULL,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE
    );
  `;

    const createSubjectsTable = `
    CREATE TABLE IF NOT EXISTS Subjects (
      subject_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT,
      class_id INT,
      term_id INT,
      subject_name VARCHAR(255) NOT NULL,
      average DECIMAL(10, 2) DEFAULT NULL,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
      FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE
    );
  `;

    const createTeachersTable = `
    CREATE TABLE IF NOT EXISTS Teachers (
      teacher_id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone_number VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      image_url VARCHAR(255),
      cv_url VARCHAR(255),
      highest_qualification VARCHAR(255) NOT NULL
    );
  `;

    const createTeacherSubjectsTable = `
    CREATE TABLE IF NOT EXISTS TeacherSubjects (
      teacher_subject_id INT AUTO_INCREMENT PRIMARY KEY,
      teacher_id INT NOT NULL,
      school_id INT NOT NULL,
      subject_id INT NOT NULL,
      class_id INT NOT NULL,
      term_id INT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id) ON DELETE CASCADE,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
      FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE
    );
  `;

    const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS Students (
      student_id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      admission_number VARCHAR(255) NOT NULL UNIQUE,
      gender VARCHAR(255) NOT NULL,
      date_of_birth DATE NOT NULL,
      pin VARCHAR(255) NOT NULL,
      image_url VARCHAR(255),
      parents_contact_info TEXT NOT NULL
    );
  `;

    const createStudentEnrollmentsTable = `
    CREATE TABLE IF NOT EXISTS StudentEnrollments (
      enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      school_id INT NOT NULL,
      class_id INT NOT NULL,
      session_id INT NOT NULL,
      term_id INT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      total DECIMAL(10, 2) DEFAULT NULL,
      average DECIMAL(10, 2) DEFAULT NULL,
      position INT DEFAULT NULL,
      FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES AcademicSessions(session_id) ON DELETE CASCADE,
      FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE
    );
  `;

    const createResultsTable = `
    CREATE TABLE IF NOT EXISTS Results (
      result_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      class_id INT NOT NULL,
      session_id INT NOT NULL,
      term_id INT NOT NULL,
      subject_id INT NOT NULL,
      total_score INT NOT NULL,
      grade VARCHAR(10),
      comment VARCHAR(255),
      position INT,
      highest_score INT,
      lowest_score INT,
      FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES AcademicSessions(session_id) ON DELETE CASCADE,
      FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE
    );
  `;

    const createGradeRulesTable = `
    CREATE TABLE IF NOT EXISTS GradeRules (
      grade_rule_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT NOT NULL,
      min_score DECIMAL(5,2) NOT NULL,
      max_score DECIMAL(5,2) NOT NULL,
      grade CHAR(2) NOT NULL,
      comment VARCHAR(255),
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE
    );
  `;

    const createAssessmentsTable = `
    CREATE TABLE IF NOT EXISTS Assessments (
      assessment_id INT AUTO_INCREMENT PRIMARY KEY,
      school_id INT NOT NULL,
      assessment_name VARCHAR(255) NOT NULL,
      max_score INT NOT NULL,
      FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE
    );
  `;

    const createAssessmentScoresTable = `
    CREATE TABLE IF NOT EXISTS AssessmentScores (
      assessment_score_id INT AUTO_INCREMENT PRIMARY KEY,
      result_id INT NOT NULL,
      assessment_id INT NOT NULL,
      score INT NOT NULL,
      FOREIGN KEY (result_id) REFERENCES Results(result_id) ON DELETE CASCADE,
      FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id) ON DELETE CASCADE
    );
  `;

    const queries = [
      dropTables,
      createSchoolTable,
      createUsageStatisticsTable,
      createAcademicSessionsTable,
      createTermsTable,
      createResultReleasesTable,
      createClassesTable,
      createSubjectsTable,
      createTeachersTable,
      createTeacherSubjectsTable,
      createStudentsTable,
      createStudentEnrollmentsTable,
      createResultsTable,
      createGradeRulesTable,
      createAssessmentsTable,
      createAssessmentScoresTable,
    ];

    for (const query of queries) {
      await connection.query(query);
    }

    res.status(200).json({ message: 'All tables dropped and created successfully.' });
  } catch (error) {
    console.error('Error creating tables:', error);
    res.status(500).json({ error: 'An error occurred while creating tables.' });
  } finally {
    connection.release();
  }
}

// Route
router.get('/initialize', initializeDatabase);

module.exports = router;
