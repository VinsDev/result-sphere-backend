const Student = require('./Student');
const Result = require('./Result');
const School = require('./School');
const Class = require('./Class');
const Term = require('./Term');
const AcademicSession = require('./AcademicSession');
const Subject = require('./Subject');
const AssessmentScore = require('./AssessmentScore');
const Assessment = require('./Assessment');
const GradeRule = require('./GradeRule');
const StudentEnrollment = require('./StudentEnrollment');
const TeacherSubject = require('./TeacherSubject');
const Teacher = require('./Teacher');
const ResultReleases = require('./ResultReleases');

// School associations
School.hasMany(AcademicSession, { foreignKey: 'school_id' });
School.hasMany(Term, { foreignKey: 'school_id' });
School.hasMany(ResultReleases, { foreignKey: 'school_id' });
School.hasMany(Class, { foreignKey: 'school_id' });
School.hasMany(Subject, { foreignKey: 'school_id' });
School.hasMany(TeacherSubject, { foreignKey: 'school_id' });
School.hasMany(StudentEnrollment, { foreignKey: 'school_id' });
School.hasMany(GradeRule, { foreignKey: 'school_id' });
School.hasMany(Assessment, { foreignKey: 'school_id' });

// AcademicSession associations
AcademicSession.belongsTo(School, { foreignKey: 'school_id' });
AcademicSession.hasMany(ResultReleases, { foreignKey: 'session_id' });
AcademicSession.hasMany(Result, { foreignKey: 'session_id' });
AcademicSession.hasMany(StudentEnrollment, { foreignKey: 'session_id' });

// Term associations
Term.belongsTo(School, { foreignKey: 'school_id' });
Term.hasMany(ResultReleases, { foreignKey: 'term_id' });
Term.hasMany(Result, { foreignKey: 'term_id' });
Term.hasMany(StudentEnrollment, { foreignKey: 'term_id' });
Term.hasMany(Subject, { foreignKey: 'term_id' });
Term.hasMany(TeacherSubject, { foreignKey: 'term_id' });

// ResultReleases associations
ResultReleases.belongsTo(School, { foreignKey: 'school_id' });
ResultReleases.belongsTo(AcademicSession, { foreignKey: 'session_id' });
ResultReleases.belongsTo(Term, { foreignKey: 'term_id' });

// Class associations
Class.belongsTo(School, { foreignKey: 'school_id' });
Class.hasMany(Subject, { foreignKey: 'class_id' });
Class.hasMany(TeacherSubject, { foreignKey: 'class_id' });
Class.hasMany(Result, { foreignKey: 'class_id' });
Class.hasMany(StudentEnrollment, { foreignKey: 'class_id' });

// Subject associations
Subject.belongsTo(School, { foreignKey: 'school_id' });
Subject.belongsTo(Class, { foreignKey: 'class_id' });
Subject.belongsTo(Term, { foreignKey: 'term_id' });
Subject.hasMany(TeacherSubject, { foreignKey: 'subject_id' });
Subject.hasMany(Result, { foreignKey: 'subject_id' });

// Teacher associations
Teacher.hasMany(TeacherSubject, { foreignKey: 'teacher_id' });

// TeacherSubject associations
TeacherSubject.belongsTo(School, { foreignKey: 'school_id' });
TeacherSubject.belongsTo(Teacher, { foreignKey: 'teacher_id' });
TeacherSubject.belongsTo(Subject, { foreignKey: 'subject_id' });
TeacherSubject.belongsTo(Class, { foreignKey: 'class_id' });
TeacherSubject.belongsTo(Term, { foreignKey: 'term_id' });

// Student associations
Student.hasMany(StudentEnrollment, { foreignKey: 'student_id' });
Student.hasMany(Result, { foreignKey: 'student_id' });

// StudentEnrollment associations
StudentEnrollment.belongsTo(School, { foreignKey: 'school_id' });
StudentEnrollment.belongsTo(Student, { foreignKey: 'student_id' });
StudentEnrollment.belongsTo(Class, { foreignKey: 'class_id' });
StudentEnrollment.belongsTo(AcademicSession, { foreignKey: 'session_id' });
StudentEnrollment.belongsTo(Term, { foreignKey: 'term_id' });

// Result associations
Result.belongsTo(Student, { foreignKey: 'student_id' });
Result.belongsTo(Class, { foreignKey: 'class_id' });
Result.belongsTo(AcademicSession, { foreignKey: 'session_id' });
Result.belongsTo(Term, { foreignKey: 'term_id' });
Result.belongsTo(Subject, { foreignKey: 'subject_id' });
Result.hasMany(AssessmentScore, { foreignKey: 'result_id' });

// AssessmentScore associations
AssessmentScore.belongsTo(Result, { foreignKey: 'result_id' });
AssessmentScore.belongsTo(Assessment, { foreignKey: 'assessment_id' });

// Assessment associations
Assessment.belongsTo(School, { foreignKey: 'school_id' });
Assessment.hasMany(AssessmentScore, { foreignKey: 'assessment_id' });

// GradeRule associations
GradeRule.belongsTo(School, { foreignKey: 'school_id' });

module.exports = {
  Student,
  Result,
  School,
  Class,
  Term,
  AcademicSession,
  Subject,
  AssessmentScore,
  Assessment,
  GradeRule,
  StudentEnrollment,
  Teacher,
  TeacherSubject,
  ResultReleases
};