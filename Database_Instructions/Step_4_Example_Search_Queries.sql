-- ============================================================
-- Project : University Enrollment System
-- Script  : Step 4 - Example Search Queries.sql
-- Purpose : DML - SQL Queries (Joins, Aggregates, Subqueries)
-- ============================================================

-- 1. Simple Select
SELECT * FROM STUDENT WHERE status = 'ACTIVE';

-- 2. Inner Join (Student with Department)
SELECT s.student_id, p.first_name, p.last_name, d.department_name
FROM STUDENT s
JOIN PERSON p ON s.student_id = p.person_id
JOIN DEPARTMENT d ON s.department_id = d.department_id;

-- 3. Outer Join (Courses with Instructors, even if no instructor)
SELECT c.course_name, p.first_name || ' ' || p.last_name as instructor_name
FROM COURSE c
LEFT JOIN INSTRUCTOR i ON c.instructor_id = i.instructor_id
LEFT JOIN PERSON p ON i.instructor_id = p.person_id;

-- 4. Aggregate Query (Count students per department)
SELECT d.department_name, COUNT(s.student_id) as total_students
FROM DEPARTMENT d
LEFT JOIN STUDENT s ON d.department_id = s.department_id
GROUP BY d.department_name;

-- 5. Subquery (Find students with GPA above average)
SELECT first_name, last_name, gpa
FROM PERSON p
JOIN STUDENT s ON p.person_id = s.student_id
WHERE gpa > (SELECT AVG(gpa) FROM STUDENT);

-- 6. Complex Join (Enrollment Details)
SELECT e.enrollment_id, p.first_name || ' ' || p.last_name as student, c.course_name, g.marks, g.letter_grade
FROM ENROLLMENT e
JOIN STUDENT s ON e.student_id = s.student_id
JOIN PERSON p ON s.student_id = p.person_id
JOIN COURSE c ON e.course_id = c.course_id
LEFT JOIN GRADE g ON e.enrollment_id = g.enrollment_id;
