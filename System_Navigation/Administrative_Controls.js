const express = require('express');
const router = express.Router();
const db = require('../System_Settings/database');
const { checkAdmin } = require('../Login_Security/auth');

// Generate random password
function generatePassword() {
    return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

function normalizeEntityStatus(status) {
    return String(status || '').trim().toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

function defaultStudentUsername(ref_id) {
    return `STUDENT_${ref_id}`;
}

function defaultInstructorUsername(ref_id) {
    return `PROF_${ref_id}`;
}

function defaultStudentPassword(ref_id) {
    return `stud${ref_id}123`;
}

function defaultInstructorPassword(ref_id) {
    return `prof${ref_id}123`;
}

async function syncMissingUserAccounts() {
    const missingStudents = await db.executeQuery(
        `SELECT s.student_id AS ref_id, s.status AS ENTITYSTATUS
         FROM STUDENT s
         LEFT JOIN APP_USERS u ON u.ref_id = s.student_id AND u.role = 'STUDENT'
         WHERE u.user_id IS NULL`,
        []
    );

    const missingInstructors = await db.executeQuery(
        `SELECT i.instructor_id AS ref_id, i.status AS ENTITYSTATUS
         FROM INSTRUCTOR i
         LEFT JOIN APP_USERS u ON u.ref_id = i.instructor_id AND u.role = 'INSTRUCTOR'
         WHERE u.user_id IS NULL`,
        []
    );

    const queries = [];

    for (const row of (missingStudents.rows || [])) {
        const ref_id = row.ref_id;
        queries.push({
            sql: `INSERT INTO APP_USERS (user_id, username, password, role, ref_id, status)
                  VALUES (seq_userid.NEXTVAL, :username, :pwd, 'STUDENT', :ref_id, :status)`,
            params: {
                username: defaultStudentUsername(ref_id),
                pwd: defaultStudentPassword(ref_id),
                ref_id,
                status: normalizeEntityStatus(row.ENTITYSTATUS)
            }
        });
    }

    for (const row of (missingInstructors.rows || [])) {
        const ref_id = row.ref_id;
        queries.push({
            sql: `INSERT INTO APP_USERS (user_id, username, password, role, ref_id, status)
                  VALUES (seq_userid.NEXTVAL, :username, :pwd, 'INSTRUCTOR', :ref_id, :status)`,
            params: {
                username: defaultInstructorUsername(ref_id),
                pwd: defaultInstructorPassword(ref_id),
                ref_id,
                status: normalizeEntityStatus(row.ENTITYSTATUS)
            }
        });
    }

    if (queries.length > 0) {
        await db.executeTransaction(queries);
    }

    return {
        studentsCreated: (missingStudents.rows || []).length,
        instructorsCreated: (missingInstructors.rows || []).length
    };
}

// Admin Dashboard
router.get('/dashboard', checkAdmin, async (req, res) => {
    try {
        const [statsResult, deptStats, enrollmentStats, topStudents] = await Promise.all([
            db.executeQuery(`
                SELECT 
                    (SELECT COUNT(*) FROM STUDENT WHERE status = 'ACTIVE') as students,
                    (SELECT COUNT(*) FROM INSTRUCTOR WHERE status = 'ACTIVE') as instructors,
                    (SELECT COUNT(*) FROM COURSE WHERE status = 'ACTIVE') as courses,
                    (SELECT COUNT(*) FROM ENROLLMENT WHERE status = 'ACTIVE') as enrollments
                FROM DUAL`, []),
            db.executeQuery(`
                SELECT d.department_name, COUNT(s.student_id) as dept_count 
                FROM DEPARTMENT d 
                LEFT JOIN STUDENT s ON d.department_id = s.department_id 
                GROUP BY d.department_name`, []),
            db.executeQuery(`
                SELECT status, COUNT(*) as status_count 
                FROM ENROLLMENT 
                GROUP BY status`, []),
            db.executeQuery(`
                SELECT full_name, course_name, marks, letter_grade FROM (
                    SELECT (p.first_name || ' ' || p.last_name) as full_name, c.course_name, g.marks, g.letter_grade
                    FROM GRADE g
                    JOIN ENROLLMENT e ON g.enrollment_id = e.enrollment_id
                    JOIN PERSON p ON e.student_id = p.person_id
                    JOIN COURSE c ON e.course_id = c.course_id
                    ORDER BY g.marks DESC
                ) WHERE ROWNUM <= 10`, [])
        ]);

        res.render('admin/dashboard', { 
            user: req.session.user,
            stats: statsResult.rows[0],
            deptStats: deptStats.rows || [],
            enrollmentStats: enrollmentStats.rows || [],
            topStudents: topStudents.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading dashboard', userRole: 'ADMIN' });
    }
});

// View All Students
router.get('/students', checkAdmin, async (req, res) => {
    try {
        await syncMissingUserAccounts();
        console.log('📌 Loading students...');
        const result = await db.executeQuery(
            `SELECT s.student_id, p.person_id, (p.first_name || ' ' || p.last_name) as full_name, p.email, p.phone,
                    s.enrollment_date, s.enrollment_year, d.department_name, s.gpa, s.total_credits, s.status
             FROM STUDENT s
             JOIN PERSON p ON s.student_id = p.person_id
             LEFT JOIN DEPARTMENT d ON s.department_id = d.department_id
             ORDER BY p.first_name, p.last_name`,
            {}
        );
        console.log('✅ Students loaded:', result.rows ? result.rows.length : 0);

        let departments = [];
        try {
            console.log('📌 Loading departments...');
            const deptResult = await db.executeQuery(
                `SELECT department_id, department_name FROM DEPARTMENT ORDER BY department_name`,
                {}
            );
            departments = deptResult.rows || [];
            console.log('✅ Departments loaded:', departments.length);
        } catch (deptErr) {
            console.error('❌ Error loading departments:', deptErr.message);
            departments = [];
        }

        console.log('📌 Rendering students view with', departments.length, 'departments');
        res.render('admin/students', { 
            user: req.session.user,
            students: result.rows || [],
            departments: departments
        });
    } catch (err) {
        console.error('❌ Error in /admin/students:', err.message);
        res.status(500).render('error', { message: 'Error loading students', userRole: 'ADMIN' });
    }
});

// View All Instructors & Manage Teachers
router.get('/teachers', checkAdmin, async (req, res) => {
    try {
        await syncMissingUserAccounts();
        const result = await db.executeQuery(
            `SELECT i.instructor_id, p.person_id, (p.first_name || ' ' || p.last_name) as full_name, p.email, p.phone,
                    i.hire_date, d.department_name, i.qualification, i.specialization, i.office_location, i.status,
                    u.username
             FROM INSTRUCTOR i
             JOIN PERSON p ON i.instructor_id = p.person_id
             LEFT JOIN DEPARTMENT d ON i.department_id = d.department_id
             LEFT JOIN APP_USERS u ON u.ref_id = i.instructor_id AND u.role = 'INSTRUCTOR'
             ORDER BY p.first_name, p.last_name`,
            {}
        );

        const departments = await db.executeQuery(
            `SELECT department_id, department_name FROM DEPARTMENT ORDER BY department_name`,
            {}
        );

        res.render('admin/teachers', { 
            user: req.session.user,
            instructors: result.rows || [],
            departments: departments.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading teachers', userRole: 'ADMIN' });
    }
});

// Alias for Manage Instructors (same as teachers)
router.get('/instructors', checkAdmin, async (req, res) => {
    try {
        await syncMissingUserAccounts();
        const result = await db.executeQuery(
            `SELECT i.instructor_id, p.person_id, (p.first_name || ' ' || p.last_name) as full_name, p.email, p.phone,
                    i.hire_date, d.department_name, i.qualification, i.specialization, i.office_location, i.status,
                    u.username
             FROM INSTRUCTOR i
             JOIN PERSON p ON i.instructor_id = p.person_id
             LEFT JOIN DEPARTMENT d ON i.department_id = d.department_id
             LEFT JOIN APP_USERS u ON u.ref_id = i.instructor_id AND u.role = 'INSTRUCTOR'
             ORDER BY p.first_name, p.last_name`,
            {}
        );

        const departments = await db.executeQuery(
            `SELECT department_id, department_name FROM DEPARTMENT ORDER BY department_name`,
            {}
        );

        res.render('admin/instructors', { 
            user: req.session.user,
            instructors: result.rows || [],
            departments: departments.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading instructors', userRole: 'ADMIN' });
    }
});

// Add Teacher
router.post('/teacher/add', checkAdmin, async (req, res) => {
    try {
        const { first_name, last_name, email, phone, department_id, hire_date, qualification, specialization, office_location } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !department_id || !hire_date) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Get next person_id
        const personIdResult = await db.executeQuery(
            `SELECT seq_personid.NEXTVAL as ID FROM DUAL`,
            {}
        );
        const person_id = personIdResult.rows[0].id;

        // Generate credentials
        const username = `PROF_${person_id}`;
        const password = generatePassword();

        // Execute as transaction to ensure atomicity
        const queries = [
            {
                sql: `INSERT INTO PERSON (person_id, first_name, last_name, email, phone) 
                      VALUES (:id, :fname, :lname, :email, :phone)`,
                params: { id: person_id, fname: first_name, lname: last_name, email: email, phone: phone || null }
            },
            {
                sql: `INSERT INTO INSTRUCTOR (instructor_id, hire_date, department_id, qualification, specialization, office_location, status) 
                      VALUES (:id, TO_DATE(:hire_date, 'YYYY-MM-DD'), :deptId, :qual, :spec, :office, 'ACTIVE')`,
                params: { id: person_id, hire_date: hire_date, deptId: department_id, qual: qualification || null, spec: specialization || null, office: office_location || null }
            },
            {
                sql: `INSERT INTO APP_USERS (user_id, username, password, role, ref_id, status) 
                      VALUES (seq_userid.NEXTVAL, :username, :pwd, 'INSTRUCTOR', :ref_id, 'ACTIVE')`,
                params: { username: username, pwd: password, ref_id: person_id }
            }
        ];

        await db.executeTransaction(queries);

        res.json({ 
            success: true, 
            message: `Teacher added! username: ${username}, password: ${password}`,
            credentials: { username, password }
        });
    } catch (err) {
        console.error('Error adding teacher:', err);
        
        // Parse specific constraint violations
        let errorMsg = 'Error adding teacher';
        if (err.message && err.message.includes('ORA-00001')) {
            errorMsg = 'Email or phone already exists - please use unique values';
        } else if (err.message && err.message.includes('ORA-02291')) {
            errorMsg = 'Invalid department selected';
        }
        
        res.json({ success: false, message: errorMsg });
    }
});

// Remove Teacher
router.post('/teacher/remove/:teacherId', checkAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;

        await db.executeTransaction([
            {
                sql: `UPDATE INSTRUCTOR SET status = 'INACTIVE' WHERE instructor_id = :id`,
                params: { id: teacherId }
            },
            {
                sql: `MERGE INTO APP_USERS u
                      USING (SELECT :ref_id AS ref_id FROM DUAL) src
                      ON (u.ref_id = src.ref_id AND u.role = 'INSTRUCTOR')
                      WHEN MATCHED THEN
                        UPDATE SET u.status = 'INACTIVE'
                      WHEN NOT MATCHED THEN
                        INSERT (user_id, username, password, role, ref_id, status)
                        VALUES (seq_userid.NEXTVAL, :username, :pwd, 'INSTRUCTOR', :ref_id, 'INACTIVE')`,
                params: {
                    ref_id: teacherId,
                    username: defaultInstructorUsername(teacherId),
                    pwd: defaultInstructorPassword(teacherId)
                }
            },
            {
                sql: `UPDATE COURSE
                      SET status = CASE WHEN UPPER(TRIM(status)) = 'ACTIVE' THEN 'INACTIVE' ELSE status END,
                          instructor_id = NULL
                      WHERE instructor_id = :id`,
                params: { id: teacherId }
            }
        ]);

        res.json({ success: true, message: 'Teacher removed successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error removing teacher' });
    }
});

// Restore Teacher
router.post('/teacher/restore/:teacherId', checkAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;

        await db.executeTransaction([
            {
                sql: `UPDATE INSTRUCTOR SET status = 'ACTIVE' WHERE instructor_id = :id`,
                params: { id: teacherId }
            },
            {
                sql: `MERGE INTO APP_USERS u
                      USING (SELECT :ref_id AS ref_id FROM DUAL) src
                      ON (u.ref_id = src.ref_id AND u.role = 'INSTRUCTOR')
                      WHEN MATCHED THEN
                        UPDATE SET u.status = 'ACTIVE'
                      WHEN NOT MATCHED THEN
                        INSERT (user_id, username, password, role, ref_id, status)
                        VALUES (seq_userid.NEXTVAL, :username, :pwd, 'INSTRUCTOR', :ref_id, 'ACTIVE')`,
                params: {
                    ref_id: teacherId,
                    username: defaultInstructorUsername(teacherId),
                    pwd: defaultInstructorPassword(teacherId)
                }
            }
        ]);

        res.json({ success: true, message: 'Teacher restored successfully' });
    } catch (err) {
        console.error('Error restoring teacher:', err);
        res.json({ success: false, message: `Error restoring teacher: ${err.message}` });
    }
});

// Add Student
router.post('/student/add', checkAdmin, async (req, res) => {
    try {
        const { first_name, last_name, email, phone, department_id, enrollment_year } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !department_id || !enrollment_year) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Get next person_id
        const personIdResult = await db.executeQuery(
            `SELECT seq_personid.NEXTVAL as ID FROM DUAL`,
            {}
        );
        const person_id = personIdResult.rows[0].id;

        // Generate credentials - ensure username uniqueness by using person_id
        const username = `STUDENT_${person_id}`;
        const password = generatePassword();

        // Execute as transaction
        const queries = [
            {
                sql: `INSERT INTO PERSON (person_id, first_name, last_name, email, phone) 
                      VALUES (:id, :fname, :lname, :email, :phone)`,
                params: { id: person_id, fname: first_name, lname: last_name, email: email, phone: phone || null }
            },
            {
                sql: `INSERT INTO STUDENT (student_id, department_id, enrollment_year, enrollment_date, status) 
                      VALUES (:id, :deptId, :year, SYSDATE, 'ACTIVE')`,
                params: { id: person_id, deptId: department_id, year: enrollment_year }
            },
            {
                sql: `INSERT INTO APP_USERS (user_id, username, password, role, ref_id, status) 
                      VALUES (seq_userid.NEXTVAL, :username, :pwd, 'STUDENT', :ref_id, 'ACTIVE')`,
                params: { username: username, pwd: password, ref_id: person_id }
            }
        ];

        await db.executeTransaction(queries);

        res.json({ 
            success: true, 
            message: `Student added! username: ${username}, password: ${password}`,
            credentials: { username, password }
        });
    } catch (err) {
        console.error('Error adding student:', err);
        
        let errorMsg = 'Error adding student';
        if (err.message && err.message.includes('ORA-00001')) {
            errorMsg = 'Email already exists - please use a unique email';
        } else if (err.message && err.message.includes('ORA-02291')) {
            errorMsg = 'Invalid department selected';
        }
        
        res.json({ success: false, message: errorMsg });
    }
});

// Remove Student
router.post('/student/remove/:student_id', checkAdmin, async (req, res) => {
    try {
        const { student_id } = req.params;

        await db.executeTransaction([
            {
                sql: `UPDATE STUDENT SET status = 'INACTIVE' WHERE student_id = :id`,
                params: { id: student_id }
            },
            {
                sql: `MERGE INTO APP_USERS u
                      USING (SELECT :ref_id AS ref_id FROM DUAL) src
                      ON (u.ref_id = src.ref_id AND u.role = 'STUDENT')
                      WHEN MATCHED THEN
                        UPDATE SET u.status = 'INACTIVE'
                      WHEN NOT MATCHED THEN
                        INSERT (user_id, username, password, role, ref_id, status)
                        VALUES (seq_userid.NEXTVAL, :username, :pwd, 'STUDENT', :ref_id, 'INACTIVE')`,
                params: {
                    ref_id: student_id,
                    username: defaultStudentUsername(student_id),
                    pwd: defaultStudentPassword(student_id)
                }
            }
        ]);

        res.json({ success: true, message: 'Student removed successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error removing student' });
    }
});

// Restore Student
router.post('/student/restore/:student_id', checkAdmin, async (req, res) => {
    try {
        const { student_id } = req.params;

        await db.executeTransaction([
            {
                sql: `UPDATE STUDENT SET status = 'ACTIVE' WHERE student_id = :id`,
                params: { id: student_id }
            },
            {
                sql: `MERGE INTO APP_USERS u
                      USING (SELECT :ref_id AS ref_id FROM DUAL) src
                      ON (u.ref_id = src.ref_id AND u.role = 'STUDENT')
                      WHEN MATCHED THEN
                        UPDATE SET u.status = 'ACTIVE'
                      WHEN NOT MATCHED THEN
                        INSERT (user_id, username, password, role, ref_id, status)
                        VALUES (seq_userid.NEXTVAL, :username, :pwd, 'STUDENT', :ref_id, 'ACTIVE')`,
                params: {
                    ref_id: student_id,
                    username: defaultStudentUsername(student_id),
                    pwd: defaultStudentPassword(student_id)
                }
            }
        ]);

        res.json({ success: true, message: 'Student restored successfully' });
    } catch (err) {
        console.error('Error restoring student:', err);
        res.json({ success: false, message: `Error restoring student: ${err.message}` });
    }
});

// View All Courses
router.get('/courses', checkAdmin, async (req, res) => {
    try {
        await syncMissingUserAccounts();
        const result = await db.executeQuery(
            `SELECT c.course_id, c.course_name, c.course_code, c.credits, c.semester,
                    c.description, c.max_capacity, c.current_enrollment, c.status,
                    c.instructor_id, (i.first_name || ' ' || i.last_name) as instructor_name, d.department_name
             FROM COURSE c
             LEFT JOIN INSTRUCTOR inst ON c.instructor_id = inst.instructor_id AND UPPER(TRIM(inst.status)) = 'ACTIVE'
             LEFT JOIN PERSON i ON inst.instructor_id = i.person_id
             LEFT JOIN DEPARTMENT d ON c.department_id = d.department_id
             ORDER BY c.course_name`,
            []
        );

        const instructors = await db.executeQuery(
            `SELECT i.instructor_id, (p.first_name || ' ' || p.last_name) as full_name
             FROM INSTRUCTOR i
             JOIN PERSON p ON i.instructor_id = p.person_id
             WHERE i.status = 'ACTIVE'
             ORDER BY p.first_name, p.last_name`,
            []
        );

        const departments = await db.executeQuery(
            `SELECT department_id, department_name FROM DEPARTMENT ORDER BY department_name`,
            []
        );

        res.render('admin/courses', { 
            user: req.session.user,
            courses: result.rows || [],
            instructors: instructors.rows || [],
            departments: departments.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading courses', userRole: 'ADMIN' });
    }
});

// Add Course
router.post('/course/add', checkAdmin, async (req, res) => {
    try {
        const { course_name, course_code, credits, semester, description, max_capacity, instructor_id, department_id } = req.body;

        await db.executeQuery(
            `INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, Description, max_capacity, instructor_id, department_id, current_enrollment, status) 
             VALUES (seq_courseid.NEXTVAL, :cname, :ccode, :credits, :sem, :desc, :capacity, :instId, :deptId, 0, 'ACTIVE')`,
            { cname: course_name, ccode: course_code, credits: credits, sem: semester, desc: description, capacity: max_capacity, instId: instructor_id || null, deptId: department_id }
        );

        res.json({ success: true, message: 'Course added successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error adding course' });
    }
});

// Assign Instructor to Course
router.post('/course/:course_id/assign-instructor', checkAdmin, async (req, res) => {
    try {
        const { course_id } = req.params;
        const { instructor_id } = req.body;

        if (!instructor_id) {
            await db.executeQuery(
                `UPDATE COURSE SET instructor_id = NULL WHERE course_id = :cId`,
                { cId: course_id }
            );
            return res.json({ success: true, message: 'Instructor removed from course' });
        }

        const activeInstructor = await db.executeQuery(
            `SELECT COUNT(*) AS COUNTVAL
             FROM INSTRUCTOR
             WHERE instructor_id = :id AND UPPER(TRIM(status)) = 'ACTIVE'`,
            { id: instructor_id }
        );

        if (!activeInstructor.rows || activeInstructor.rows[0].COUNTVAL === 0) {
            return res.json({ success: false, message: 'Only active instructors can be assigned' });
        }

        await db.executeQuery(
            `UPDATE COURSE SET instructor_id = :instId WHERE course_id = :cId`,
            { instId: instructor_id, cId: course_id }
        );

        res.json({ success: true, message: 'Instructor assigned successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error assigning instructor' });
    }
});

// Remove Course
router.post('/course/remove/:course_id', checkAdmin, async (req, res) => {
    try {
        const { course_id } = req.params;

        await db.executeQuery(
            `UPDATE COURSE SET status = 'INACTIVE' WHERE course_id = :id`,
            { id: course_id }
        );

        res.json({ success: true, message: 'Course removed successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'Error removing course' });
    }
});

// Restore Course
router.post('/course/restore/:course_id', checkAdmin, async (req, res) => {
    try {
        const { course_id } = req.params;

        await db.executeQuery(
            `UPDATE COURSE SET status = 'ACTIVE' WHERE course_id = :id`,
            { id: course_id }
        );

        res.json({ success: true, message: 'Course restored successfully' });
    } catch (err) {
        console.error('Error restoring course:', err);
        res.json({ success: false, message: `Error restoring course: ${err.message}` });
    }
});

// View All Enrollments
router.get('/enrollments', checkAdmin, async (req, res) => {
    try {
        const result = await db.executeQuery(
            `SELECT e.enrollment_id AS ENROLLID, (p.first_name || ' ' || p.last_name) AS student_name,
                    c.course_name AS course_name, e.enrollment_date AS ENROLLDATE, e.enrollment_year AS enrollment_year, e.status AS status,
                    NVL(TO_CHAR(g.marks), 'N/A') as marks, NVL(g.letter_grade, 'N/A') as letter_grade
             FROM ENROLLMENT e
             JOIN STUDENT s ON e.student_id = s.student_id
             JOIN PERSON p ON s.student_id = p.person_id
             JOIN COURSE c ON e.course_id = c.course_id
             LEFT JOIN GRADE g ON e.enrollment_id = g.enrollment_id
             ORDER BY e.enrollment_date DESC`,
            []
        );

        res.render('admin/enrollments', { 
            user: req.session.user,
            enrollments: result.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading enrollments', userRole: 'ADMIN' });
    }
});

// View All Grades
router.get('/grades', checkAdmin, async (req, res) => {
    try {
        const result = await db.executeQuery(
            `SELECT g.grade_id AS grade_id, c.course_name AS course_name, (p.first_name || ' ' || p.last_name) AS student_name,
                    g.marks AS marks, g.letter_grade AS letter_grade, g.created_date AS GRADEDATE,
                    e.enrollment_id AS ENROLLID,
                    UPPER(TRIM(e.status)) AS status,
                    CASE WHEN UPPER(TRIM(e.status)) = 'ACTIVE' THEN 'ACTIVE' ELSE 'WITHDRAWN' END AS ENROLLSTATUS
             FROM GRADE g
             JOIN ENROLLMENT e ON g.enrollment_id = e.enrollment_id
             JOIN COURSE c ON e.course_id = c.course_id
             JOIN STUDENT s ON e.student_id = s.student_id
             JOIN PERSON p ON s.student_id = p.person_id
             ORDER BY (CASE WHEN UPPER(TRIM(e.status)) = 'ACTIVE' THEN 0 ELSE 1 END), g.created_date DESC`,
            []
        );

        res.render('admin/grades', { 
            user: req.session.user,
            grades: result.rows || []
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).render('error', { message: 'Error loading grades', userRole: 'ADMIN' });
    }
});

// View and manage application users (admin)
router.get('/users', checkAdmin, async (req, res) => {
    try {
        await syncMissingUserAccounts();
        const result = await db.executeQuery(
            `SELECT user_id, username, password, role, ref_id, status FROM APP_USERS ORDER BY role, username`,
            []
        );

        res.render('admin/users', {
            user: req.session.user,
            users: result.rows || []
        });
    } catch (err) {
        console.error('Error loading users:', err);
        res.status(500).render('error', { message: 'Error loading users', userRole: 'ADMIN' });
    }
});

// Activate a user
router.post('/user/:user_id/activate', checkAdmin, async (req, res) => {
    try {
        const { user_id } = req.params;
        await db.executeQuery(`UPDATE APP_USERS SET status = 'ACTIVE' WHERE user_id = :user_id`, { user_id });
        res.json({ success: true, message: 'User activated' });
    } catch (err) {
        console.error('Error activating user:', err);
        res.json({ success: false, message: 'Error activating user: ' + (err.message || err) });
    }
});

// Deactivate a user
router.post('/user/:user_id/deactivate', checkAdmin, async (req, res) => {
    try {
        const { user_id } = req.params;
        await db.executeQuery(`UPDATE APP_USERS SET status = 'INACTIVE' WHERE user_id = :user_id`, { user_id });
        res.json({ success: true, message: 'User deactivated' });
    } catch (err) {
        console.error('Error deactivating user:', err);
        res.json({ success: false, message: 'Error deactivating user: ' + (err.message || err) });
    }
});

module.exports = router;
