const express = require('express');
const router = express.Router();
const db = require('../System_Settings/database');
const { checkInstructor } = require('../Login_Security/auth');

// Teacher Dashboard
router.get('/dashboard', checkInstructor, async (req, res) => {
    try {
        const instructor_id = req.session.user.ref_id;

        // Get teacher's courses
        const coursesResult = await db.executeQuery(
            `SELECT c.course_id, c.course_name, c.credits, c.semester,
                    COUNT(DISTINCT CASE WHEN e.status = 'ACTIVE' THEN e.student_id END) as StudentCount 
             FROM COURSE c 
             LEFT JOIN ENROLLMENT e ON c.course_id = e.course_id 
             WHERE c.instructor_id = :instructor_id
             GROUP BY c.course_id, c.course_name, c.credits, c.semester`,
            { instructor_id }
        );

        res.render('teacher/dashboard', { 
            user: req.session.user, 
            courses: coursesResult.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading dashboard', userRole: 'INSTRUCTOR' });
    }
});

// View Students in a Course
router.get('/course/:course_id/students', checkInstructor, async (req, res) => {
    try {
        const { course_id } = req.params;
        const instructor_id = req.session.user.ref_id;

        // Verify this course belongs to the instructor
        const courseCheck = await db.executeQuery(
            `SELECT course_id FROM COURSE WHERE course_id = :course_id AND instructor_id = :instructor_id`,
            { course_id, instructor_id }
        );

        if (!courseCheck.rows || courseCheck.rows.length === 0) {
            return res.status(403).render('error', { message: 'You do not have access to this course', userRole: 'INSTRUCTOR' });
        }

        // Get students in this course
        const studentsResult = await db.executeQuery(
            `SELECT e.enrollment_id, p.person_id, (p.first_name || ' ' || p.last_name) as full_name, p.email, e.enrollment_date, 
                    NVL(TO_CHAR(g.marks), 'N/A') as marks, NVL(g.letter_grade, 'N/A') as letter_grade
             FROM ENROLLMENT e 
             JOIN STUDENT s ON e.student_id = s.student_id 
             JOIN PERSON p ON s.student_id = p.person_id 
             LEFT JOIN GRADE g ON e.enrollment_id = g.enrollment_id
             WHERE e.course_id = :course_id AND e.status = 'ACTIVE'
             ORDER BY p.first_name, p.last_name`,
            { course_id }
        );

        const courseResult = await db.executeQuery(
            `SELECT course_name FROM COURSE WHERE course_id = :course_id`,
            { course_id }
        );

        res.render('teacher/students', { 
            user: req.session.user, 
            students: studentsResult.rows || [],
            course_name: courseResult.rows[0].course_name,
            course_id: course_id
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading students', userRole: 'INSTRUCTOR' });
    }
});

// Update Grade for a Student
router.post('/grade/update', checkInstructor, async (req, res) => {
    try {
        const { enrollId, marks } = req.body;
        const instructor_id = req.session.user.ref_id;

        // Verify enrollment exists and belongs to this instructor's course
        const result = await db.executeQuery(
            `SELECT e.enrollment_id, e.course_id, c.instructor_id 
             FROM ENROLLMENT e 
             JOIN COURSE c ON e.course_id = c.course_id 
             WHERE e.enrollment_id = :enrollId`,
            { enrollId }
        );

        if (!result.rows || result.rows.length === 0) {
            return res.json({ success: false, message: 'Enrollment not found' });
        }

        // Check if instructor owns this course
        const courseInstructorId = result.rows[0].instructor_id;
        if (courseInstructorId !== instructor_id) {
            return res.json({ success: false, message: 'You do not have access to update this grade' });
        }

        // Determine letter grade
        let letter_grade = '';
        const marksNum = parseFloat(marks);
        if (marksNum >= 90) letter_grade = 'A';
        else if (marksNum >= 80) letter_grade = 'B';
        else if (marksNum >= 70) letter_grade = 'C';
        else if (marksNum >= 60) letter_grade = 'D';
        else letter_grade = 'F';

        // Update or insert grade
        await db.executeQuery(
            `MERGE INTO GRADE g 
             USING DUAL 
             ON (g.enrollment_id = :enrollId) 
             WHEN MATCHED THEN 
               UPDATE SET g.marks = :marks, g.letter_grade = :letter_grade
             WHEN NOT MATCHED THEN 
               INSERT (grade_id, enrollment_id, marks, letter_grade, created_date) 
               VALUES (seq_gradeid.NEXTVAL, :enrollId, :marks, :letter_grade, SYSDATE)`,
            { enrollId, marks, letter_grade }
        );

        res.json({ success: true, message: 'Grade updated successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error updating grade: ' + err.message });
    }
});

module.exports = router;
