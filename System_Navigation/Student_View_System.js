const express = require('express');
const router = express.Router();
const db = require('../System_Settings/database');
const { checkStudent } = require('../Login_Security/auth');

// Student Dashboard
router.get('/dashboard', checkStudent, async (req, res) => {
    try {
        const student_id = req.session.user.ref_id;

        // Get student's enrollments and grades
        const result = await db.executeQuery(
            `SELECT c.course_name AS course_name, c.credits AS CREDITHRS, e.enrollment_date AS ENROLLDATE, 
                NVL(TO_CHAR(g.marks), 'N/A') AS marks, NVL(g.letter_grade, 'N/A') AS letter_grade
             FROM ENROLLMENT e 
             JOIN COURSE c ON e.course_id = c.course_id 
             LEFT JOIN GRADE g ON e.enrollment_id = g.enrollment_id
             WHERE e.student_id = :student_id AND e.status = 'ACTIVE'
             ORDER BY e.enrollment_date DESC`,
            [student_id]
        );

        res.render('student/dashboard', { 
            user: req.session.user, 
            enrollments: result.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading dashboard', userRole: 'STUDENT' });
    }
});

// View My Grades
router.get('/grades', checkStudent, async (req, res) => {
    try {
        const student_id = req.session.user.ref_id;

        const result = await db.executeQuery(
            `SELECT c.course_name AS course_name, g.marks AS marks, g.letter_grade AS letter_grade, g.created_date AS GRADEDATE, c.credits AS CREDITHRS 
             FROM GRADE g 
             JOIN ENROLLMENT e ON g.enrollment_id = e.enrollment_id 
             JOIN COURSE c ON e.course_id = c.course_id 
             WHERE e.student_id = :student_id AND e.status = 'ACTIVE'
             ORDER BY g.created_date DESC`,
            [student_id]
        );

        // Calculate GPA
        let totalGradePoints = 0;
        let totalCredits = 0;

        if (result.rows) {
            result.rows.forEach(row => {
                const gradePoint = getGradePoint(row.letter_grade);
                totalGradePoints += gradePoint * row.CREDITHRS;
                totalCredits += row.CREDITHRS;
            });
        }

        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        res.render('student/grades', { 
            user: req.session.user, 
            grades: result.rows || [],
            gpa: gpa
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading grades', userRole: 'STUDENT' });
    }
});

// View My Courses
router.get('/courses', checkStudent, async (req, res) => {
    try {
        const student_id = req.session.user.ref_id;

        const result = await db.executeQuery(
            `SELECT c.course_id, c.course_name, c.credits, c.semester, 
                    (p.first_name || ' ' || p.last_name) as instructor_name, d.department_name
             FROM ENROLLMENT e 
             JOIN COURSE c ON e.course_id = c.course_id 
             LEFT JOIN INSTRUCTOR i ON c.instructor_id = i.instructor_id
             LEFT JOIN PERSON p ON i.instructor_id = p.person_id
             LEFT JOIN DEPARTMENT d ON c.department_id = d.department_id
             WHERE e.student_id = :student_id AND e.status = 'ACTIVE'
             ORDER BY c.course_name`,
            [student_id]
        );

        res.render('student/courses', { 
            user: req.session.user, 
            courses: result.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading courses', userRole: 'STUDENT' });
    }
});

// View My Transcript
router.get('/transcript', checkStudent, async (req, res) => {
    try {
        const student_id = req.session.user.ref_id;

        // Get student info
        const studentResult = await db.executeQuery(
            `SELECT (p.first_name || ' ' || p.last_name) as full_name, p.email, s.enrollment_date, s.gpa, s.total_credits 
             FROM STUDENT s 
             JOIN PERSON p ON s.student_id = p.person_id 
             WHERE s.student_id = :student_id`,
            [student_id]
        );

        // Get all grades
        const gradesResult = await db.executeQuery(
            `SELECT c.course_name AS course_name, g.marks AS marks, g.letter_grade AS letter_grade, c.credits AS CREDITHRS, g.created_date AS GRADEDATE 
             FROM GRADE g 
             JOIN ENROLLMENT e ON g.enrollment_id = e.enrollment_id 
             JOIN COURSE c ON e.course_id = c.course_id 
             WHERE e.student_id = :student_id AND e.status = 'ACTIVE'
             ORDER BY g.created_date DESC`,
            [student_id]
        );

        // Calculate GPA
        let totalGradePoints = 0;
        let totalCredits = 0;

        if (gradesResult.rows) {
            gradesResult.rows.forEach(row => {
                const gradePoint = getGradePoint(row.letter_grade);
                totalGradePoints += gradePoint * row.CREDITHRS;
                totalCredits += row.CREDITHRS;
            });
        }

        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        res.render('student/transcript', { 
            user: req.session.user, 
            student: studentResult.rows[0] || {},
            grades: gradesResult.rows || [],
            gpa: gpa,
            totalCredits: totalCredits
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading transcript', userRole: 'STUDENT' });
    }
});

// View Available Courses for Enrollment
router.get('/available-courses', checkStudent, async (req, res) => {
    try {
        const student_id = req.session.user.ref_id;

        // Get student's department
        const studentDeptResult = await db.executeQuery(
            `SELECT department_id FROM STUDENT WHERE student_id = :student_id`,
            { student_id }
        );
        const studentDept = studentDeptResult.rows[0]?.department_id;

        // Get available courses in student's department (not already enrolled)
        const result = await db.executeQuery(
            `SELECT c.course_id, c.course_name, c.course_code, c.credits, c.semester, c.description, c.max_capacity, c.current_enrollment,
                    (p.first_name || ' ' || p.last_name) as instructor_name, d.department_name
             FROM COURSE c
             LEFT JOIN INSTRUCTOR i ON c.instructor_id = i.instructor_id
             LEFT JOIN PERSON p ON i.instructor_id = p.person_id
             LEFT JOIN DEPARTMENT d ON c.department_id = d.department_id
             WHERE c.status = 'ACTIVE' AND c.department_id = :deptId
             AND c.course_id NOT IN (SELECT course_id FROM ENROLLMENT WHERE student_id = :student_id AND status = 'ACTIVE')
             ORDER BY c.course_name`,
            { deptId: studentDept, student_id }
        );

        res.render('student/available-courses', { 
            user: req.session.user, 
            courses: result.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading available courses', userRole: 'STUDENT' });
    }
});

// Enroll in a Course
router.post('/enroll', checkStudent, async (req, res) => {
    try {
        const { course_id } = req.body;
        const student_id = req.session.user.ref_id;

        // Check if student already enrolled
        const existingEnrollment = await db.executeQuery(
            `SELECT enrollment_id FROM ENROLLMENT WHERE student_id = :student_id AND course_id = :course_id AND status = 'ACTIVE'`,
            { student_id, course_id }
        );

        if (existingEnrollment.rows && existingEnrollment.rows.length > 0) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        // Check course capacity
        const courseInfo = await db.executeQuery(
            `SELECT max_capacity, current_enrollment FROM COURSE WHERE course_id = :course_id`,
            { course_id }
        );

        if (courseInfo.rows[0].current_enrollment >= courseInfo.rows[0].max_capacity) {
            return res.json({ success: false, message: 'Course is full' });
        }

        // Insert enrollment  - calculate next ID manually to avoid sequence issues
        const maxIdResult = await db.executeQuery(
            `SELECT NVL(MAX(enrollment_id), 0) + 1 as NextID FROM ENROLLMENT`,
            {}
        );
        const nextId = maxIdResult.rows[0].nextid;
        
        await db.executeQuery(
            `INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) 
             VALUES (:nextId, :student_id, :course_id, TRUNC(SYSDATE), 2024, 'ACTIVE')`,
            { nextId, student_id, course_id }
        );

        // Update course enrollment count
        await db.executeQuery(
            `UPDATE COURSE SET current_enrollment = current_enrollment + 1 WHERE course_id = :course_id`,
            { course_id }
        );

        res.json({ success: true, message: 'Successfully enrolled in course!' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error enrolling in course: ' + err.message });
    }
});

// Unenroll from a Course
router.post('/unenroll/:course_id', checkStudent, async (req, res) => {
    try {
        const { course_id } = req.params;
        const student_id = req.session.user.ref_id;
        // Check for existing active enrollment
        const check = await db.executeQuery(
            `SELECT enrollment_id FROM ENROLLMENT WHERE student_id = :student_id AND course_id = :course_id AND status = 'ACTIVE'`,
            { student_id, course_id }
        );

        if (!check.rows || check.rows.length === 0) {
            return res.json({ success: false, message: 'No active enrollment found for this course' });
        }

        const enrollment_id = check.rows[0].enrollment_id;

        // Perform updates in a transaction: mark inactive and decrement course count
        await db.executeTransaction([
            { sql: `UPDATE ENROLLMENT SET status = 'INACTIVE' WHERE enrollment_id = :eid`, params: { eid: enrollment_id } },
            { sql: `UPDATE COURSE SET current_enrollment = CASE WHEN current_enrollment > 0 THEN current_enrollment - 1 ELSE 0 END WHERE course_id = :course_id`, params: { course_id } }
        ]);

        res.json({ success: true, message: 'Successfully unenrolled from course' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error unenrolling from course: ' + (err.message || 'Unknown error') });
    }
});

// Helper function to get grade point
function getGradePoint(letter_grade) {
    const gradeMap = {
        'A': 4.0,
        'B': 3.0,
        'C': 2.0,
        'D': 1.0,
        'F': 0.0
    };
    return gradeMap[letter_grade] || 0;
}

module.exports = router;
