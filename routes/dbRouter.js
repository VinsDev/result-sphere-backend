const { Pool } = require('pg');
const express = require('express');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Controller function
async function initializeDatabase(req, res) {
  const client = await pool.connect();

  try {
    // Drop existing tables
    // const dropTables = `
    //   DROP TABLE IF EXISTS "AssessmentScores";
    //   DROP TABLE IF EXISTS "Assessments";
    //   DROP TABLE IF EXISTS "GradeRules";
    //   DROP TABLE IF EXISTS "Results";
    //   DROP TABLE IF EXISTS "StudentEnrollments";
    //   DROP TABLE IF EXISTS "Students";
    //   DROP TABLE IF EXISTS "TeacherSubjects";
    //   DROP TABLE IF EXISTS "Teachers";
    //   DROP TABLE IF EXISTS "Subjects";
    //   DROP TABLE IF EXISTS "Classes";
    //   DROP TABLE IF EXISTS "ResultReleases";
    //   DROP TABLE IF EXISTS "Terms";
    //   DROP TABLE IF EXISTS "AcademicSessions";
    //   DROP TABLE IF EXISTS "UsageStatistics";
    //   DROP TABLE IF EXISTS "Schools";
    // `;

    const dropTables = `
      DROP TABLE IF EXISTS "assessmentscores";
      DROP TABLE IF EXISTS "assessments";
      DROP TABLE IF EXISTS "graderules";
      DROP TABLE IF EXISTS "results";
      DROP TABLE IF EXISTS "studentenrollments";
      DROP TABLE IF EXISTS "students";
      DROP TABLE IF EXISTS "teachersubjects";
      DROP TABLE IF EXISTS "teachers";
      DROP TABLE IF EXISTS "subjects";
      DROP TABLE IF EXISTS "classes";
      DROP TABLE IF EXISTS "resultreleases";
      DROP TABLE IF EXISTS "terms";
      DROP TABLE IF EXISTS "academicsessions";
      DROP TABLE IF EXISTS "usagestatistics";
      DROP TABLE IF EXISTS "schools";
    `;

    // Create tables
    const createSchoolTable = `
    CREATE TABLE IF NOT EXISTS "Schools" (
      "school_id" SERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "email" VARCHAR(255) NOT NULL UNIQUE,
      "phone_number" VARCHAR(255) NOT NULL,
      "password" VARCHAR(255) NOT NULL,
      "address" TEXT NOT NULL,
      "category" VARCHAR(255) NOT NULL,
      "head" VARCHAR(255) NOT NULL,
      "head_image" VARCHAR(255),
      "deputy1" VARCHAR(255) NOT NULL,
      "deputy1_image" VARCHAR(255),
      "deputy2" VARCHAR(255),
      "deputy2_image" VARCHAR(255),
      "anthem" TEXT NOT NULL,
      "about" TEXT NOT NULL,
      "vision" TEXT NOT NULL,
      "show_position" BOOLEAN NOT NULL DEFAULT false,
      "logo" VARCHAR(255),
      "school_image" VARCHAR(255)
    );
  `;

    const createUsageStatisticsTable = `
    CREATE TABLE IF NOT EXISTS "UsageStatistics" (
      "school_id" INTEGER PRIMARY KEY REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "units_purchased" INTEGER NOT NULL,
      "units_left" INTEGER NOT NULL,
      "plan" VARCHAR(255),
      "status" BOOLEAN NOT NULL DEFAULT FALSE,
      "usage_percentage" DECIMAL(5, 2) DEFAULT 0
    );
  `;

    const createAcademicSessionsTable = `
    CREATE TABLE IF NOT EXISTS "AcademicSessions" (
      "session_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "session_name" VARCHAR(255) NOT NULL,
      "start_date" DATE,
      "end_date" DATE,
      "current_session" BOOLEAN DEFAULT FALSE
    );
  `;

    const createTermsTable = `
    CREATE TABLE IF NOT EXISTS "Terms" (
      "term_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "term_name" VARCHAR(255) NOT NULL,
      "start_date" DATE,
      "end_date" DATE,
      "current_term" BOOLEAN DEFAULT FALSE
    );
  `;

    const createResultReleasesTable = `
    CREATE TABLE IF NOT EXISTS "ResultReleases" (
      "release_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "session_id" INTEGER NOT NULL REFERENCES "AcademicSessions"("session_id") ON DELETE CASCADE,
      "term_id" INTEGER NOT NULL REFERENCES "Terms"("term_id") ON DELETE CASCADE,
      "is_published" BOOLEAN DEFAULT FALSE
    );
  `;

    const createClassesTable = `
    CREATE TABLE IF NOT EXISTS "Classes" (
      "class_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "class_name" VARCHAR(255) NOT NULL
    );
  `;

    const createSubjectsTable = `
    CREATE TABLE IF NOT EXISTS "Subjects" (
      "subject_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "class_id" INTEGER REFERENCES "Classes"("class_id") ON DELETE CASCADE,
      "term_id" INTEGER REFERENCES "Terms"("term_id") ON DELETE CASCADE,
      "subject_name" VARCHAR(255) NOT NULL
    );
  `;

    const createTeachersTable = `
    CREATE TABLE IF NOT EXISTS "Teachers" (
      "teacher_id" SERIAL PRIMARY KEY,
      "full_name" VARCHAR(255) NOT NULL,
      "email" VARCHAR(255) NOT NULL UNIQUE,
      "phone_number" VARCHAR(255) NOT NULL,
      "address" TEXT NOT NULL,
      "image_url" VARCHAR(255),
      "cv_url" VARCHAR(255),
      "highest_qualification" VARCHAR(255) NOT NULL
    );
  `;

    const createTeacherSubjectsTable = `
    CREATE TABLE IF NOT EXISTS "TeacherSubjects" (
      "teacher_subject_id" SERIAL PRIMARY KEY,
      "teacher_id" INTEGER NOT NULL REFERENCES "Teachers"("teacher_id") ON DELETE CASCADE,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "subject_id" INTEGER NOT NULL REFERENCES "Subjects"("subject_id") ON DELETE CASCADE,
      "class_id" INTEGER NOT NULL REFERENCES "Classes"("class_id") ON DELETE CASCADE,
      "term_id" INTEGER NOT NULL REFERENCES "Terms"("term_id") ON DELETE CASCADE
    );
  `;

    const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS "Students" (
      "student_id" SERIAL PRIMARY KEY,
      "full_name" VARCHAR(255) NOT NULL,
      "admission_number" VARCHAR(255) NOT NULL UNIQUE,
      "pin" VARCHAR(255) NOT NULL,
      "image_url" VARCHAR(255),
      "parents_contact_info" TEXT NOT NULL
    );
  `;

    const createStudentEnrollmentsTable = `
    CREATE TABLE IF NOT EXISTS "StudentEnrollments" (
      "enrollment_id" SERIAL PRIMARY KEY,
      "student_id" INTEGER NOT NULL REFERENCES "Students"("student_id") ON DELETE CASCADE,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "class_id" INTEGER NOT NULL REFERENCES "Classes"("class_id") ON DELETE CASCADE,
      "session_id" INTEGER NOT NULL REFERENCES "AcademicSessions"("session_id") ON DELETE CASCADE,
      "term_id" INTEGER NOT NULL REFERENCES "Terms"("term_id") ON DELETE CASCADE,
      "is_active" BOOLEAN DEFAULT TRUE,
      "total" DECIMAL(10, 2) DEFAULT NULL,
      "average" DECIMAL(10, 2) DEFAULT NULL,
      "position" INTEGER DEFAULT NULL
    );
  `;

    const createResultsTable = `
    CREATE TABLE IF NOT EXISTS "Results" (
      "result_id" SERIAL PRIMARY KEY,
      "student_id" INTEGER NOT NULL REFERENCES "Students"("student_id") ON DELETE CASCADE,
      "class_id" INTEGER NOT NULL REFERENCES "Classes"("class_id") ON DELETE CASCADE,
      "session_id" INTEGER NOT NULL REFERENCES "AcademicSessions"("session_id") ON DELETE CASCADE,
      "term_id" INTEGER NOT NULL REFERENCES "Terms"("term_id") ON DELETE CASCADE,
      "subject_id" INTEGER NOT NULL REFERENCES "Subjects"("subject_id") ON DELETE CASCADE,
      "total_score" INTEGER NOT NULL,
      "grade" VARCHAR(10),
      "comment" VARCHAR(255),
      "position" INTEGER,
      "highest_score" INTEGER,
      "lowest_score" INTEGER
    );
  `;

    const createGradeRulesTable = `
    CREATE TABLE IF NOT EXISTS "GradeRules" (
      "grade_rule_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "min_score" DECIMAL(5,2) NOT NULL,
      "max_score" DECIMAL(5,2) NOT NULL,
      "grade" CHAR(2) NOT NULL,
      "comment" VARCHAR(255)
    );
  `;

    const createAssessmentsTable = `
    CREATE TABLE IF NOT EXISTS "Assessments" (
      "assessment_id" SERIAL PRIMARY KEY,
      "school_id" INTEGER NOT NULL REFERENCES "Schools"("school_id") ON DELETE CASCADE,
      "assessment_name" VARCHAR(255) NOT NULL,
      "max_score" INTEGER NOT NULL
    );
  `;

    const createAssessmentScoresTable = `
    CREATE TABLE IF NOT EXISTS "AssessmentScores" (
      "assessment_score_id" SERIAL PRIMARY KEY,
      "result_id" INTEGER NOT NULL REFERENCES "Results"("result_id") ON DELETE CASCADE,
      "assessment_id" INTEGER NOT NULL REFERENCES "Assessments"("assessment_id") ON DELETE CASCADE,
      "score" INTEGER NOT NULL
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
      createAssessmentScoresTable
    ];

    for (const query of queries) {
      await client.query(query);
    }

    res.status(200).json({ message: 'All tables dropped and created successfully.' });
  } catch (error) {
    console.error('Error creating tables:', error);
    res.status(500).json({ error: 'An error occurred while creating tables.' });
  } finally {
    client.release();
  }
}

// Route
router.get('/initialize', initializeDatabase);

module.exports = router;
