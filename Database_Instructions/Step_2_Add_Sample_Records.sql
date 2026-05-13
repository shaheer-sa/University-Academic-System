-- ============================================================
-- Project : University Enrollment System
-- Script  : Step 2 - Add Sample Records.sql
-- Purpose : DML - Clean, Unique Sample Data (No Redundancy)
-- ============================================================

SET SERVEROUTPUT ON;

-- ==================== CLEAN UP OLD APP USERS (Except System Admin) ====================
DELETE FROM APP_USERS WHERE username NOT IN ('ADMIN', 'registrar');

-- ==================== 1. DEPARTMENTS (5 Unique) ====================
DELETE FROM DEPARTMENT;
INSERT INTO DEPARTMENT (department_id, department_name, location) VALUES (1, 'Computer Science', 'Block A');
INSERT INTO DEPARTMENT (department_name, location) VALUES (2, 'Electrical Engineering', 'Block B');
INSERT INTO DEPARTMENT (department_name, location) VALUES (3, 'Business Administration', 'Block C');
INSERT INTO DEPARTMENT (department_name, location) VALUES (4, 'Mathematics', 'Block D');
INSERT INTO DEPARTMENT (department_name, location) VALUES (5, 'Physics', 'Block E');

-- ==================== 2. PERSONS (30 Unique) ====================
DELETE FROM PERSON;
-- Students (1-20)
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (1, 'Ali', 'Ahmed', 'ali.ahmed@univ.edu', '03001234561');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (2, 'Babar', 'Azam', 'babar.azam@univ.edu', '03001234562');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (3, 'Shaheen', 'Afridi', 'shaheen@univ.edu', '03001234563');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (4, 'Rizwan', 'Mohammad', 'rizwan@univ.edu', '03001234564');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (5, 'Shadab', 'Khan', 'shadab@univ.edu', '03001234565');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (6, 'Fakhar', 'Zaman', 'fakhar@univ.edu', '03001234566');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (7, 'Haris', 'Rauf', 'haris@univ.edu', '03001234567');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (8, 'Naseem', 'Shah', 'naseem@univ.edu', '03001234568');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (9, 'Iftikhar', 'Ahmed', 'chachu@univ.edu', '03001234569');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (10, 'Imad', 'Wasim', 'imad@univ.edu', '03001234570');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (11, 'Saim', 'Ayub', 'saim@univ.edu', '03001234571');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (12, 'Azam', 'Khan', 'azam@univ.edu', '03001234572');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (13, 'Usama', 'Mir', 'usama@univ.edu', '03001234573');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (14, 'Abrar', 'Ahmed', 'abrar@univ.edu', '03001234574');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (15, 'Irfan', 'Khan', 'irfan@univ.edu', '03001234575');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (16, 'Wasim', 'Akram', 'wasim@univ.edu', '03001234576');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (17, 'Waqar', 'Younis', 'waqar@univ.edu', '03001234577');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (18, 'Shoaib', 'Akhtar', 'shoaib@univ.edu', '03001234578');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (19, 'Misbah', 'Ulhaq', 'misbah@univ.edu', '03001234579');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (20, 'Younis', 'Khan', 'younis@univ.edu', '03001234580');

-- Instructors (21-25)
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (21, 'Dr. Arshad', 'Khan', 'arshad@univ.edu', '03119876541');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (22, 'Dr. Sarah', 'Mano', 'sarah@univ.edu', '03119876542');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (23, 'Prof. Kashif', 'Memon', 'kashif@univ.edu', '03119876543');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (24, 'Ms. Maria', 'Ali', 'maria.a@univ.edu', '03119876544');
INSERT INTO PERSON (person_id, first_name, last_name, email, phone) VALUES (25, 'Mr. Zafar', 'Iqbal', 'zafar@univ.edu', '03119876545');

-- ==================== 3. STUDENTS (20 Unique) ====================
DELETE FROM STUDENT;
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (1, 2024, 1, 3.8, 15);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (2, 2024, 1, 3.5, 15);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (3, 2024, 1, 3.2, 12);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (4, 2024, 2, 3.9, 18);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (5, 2024, 2, 3.1, 12);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (6, 2024, 3, 2.8, 9);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (7, 2024, 3, 3.4, 15);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (8, 2024, 4, 3.7, 15);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (9, 2024, 5, 3.0, 12);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (10, 2023, 1, 3.6, 30);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (11, 2023, 2, 3.3, 28);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (12, 2023, 3, 3.5, 32);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (13, 2023, 4, 2.9, 25);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (14, 2023, 5, 3.2, 27);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (15, 2022, 1, 3.1, 60);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (16, 2022, 2, 3.4, 58);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (17, 2022, 3, 3.8, 62);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (18, 2022, 4, 3.9, 65);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (19, 2022, 5, 3.7, 59);
INSERT INTO STUDENT (student_id, enrollment_year, department_id, gpa, total_credits) VALUES (20, 2021, 1, 4.0, 95);

-- ==================== 4. INSTRUCTORS (5 Unique) ====================
DELETE FROM INSTRUCTOR;
INSERT INTO INSTRUCTOR (instructor_id, hire_date, rank, department_id, office_location) VALUES (21, SYSDATE-3000, 'Professor', 1, 'Office 101');
INSERT INTO INSTRUCTOR (instructor_id, hire_date, rank, department_id, office_location) VALUES (22, SYSDATE-2500, 'Associate Professor', 2, 'Office 102');
INSERT INTO INSTRUCTOR (instructor_id, hire_date, rank, department_id, office_location) VALUES (23, SYSDATE-2000, 'Assistant Professor', 3, 'Office 103');
INSERT INTO INSTRUCTOR (instructor_id, hire_date, rank, department_id, office_location) VALUES (24, SYSDATE-1500, 'Lecturer', 1, 'Office 104');
INSERT INTO INSTRUCTOR (instructor_id, hire_date, rank, department_id, office_location) VALUES (25, SYSDATE-1000, 'Lecturer', 4, 'Office 105');

-- ==================== 5. COURSES (10 Unique) ====================
DELETE FROM COURSE;
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (1, 'Database Systems', 'CS301', 3, 'Fall', 1, 21, 50, 20);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (2, 'Software Engineering', 'CS302', 3, 'Fall', 1, 24, 40, 10);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (3, 'Digital Logic Design', 'EE201', 4, 'Spring', 2, 22, 30, 5);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (4, 'Principles of Management', 'BA101', 3, 'Fall', 3, 23, 60, 5);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (5, 'Calculus I', 'MA101', 3, 'Spring', 4, 25, 100, 5);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (6, 'Programming Fundamentals', 'CS101', 4, 'Fall', 1, 21, 120, 0);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (7, 'Microprocessors', 'EE202', 3, 'Spring', 2, 22, 45, 0);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (8, 'Financial Accounting', 'BA102', 3, 'Fall', 3, 23, 55, 0);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (9, 'Linear Algebra', 'MA102', 3, 'Spring', 4, 25, 80, 0);
INSERT INTO COURSE (course_id, course_name, course_code, credits, semester, department_id, instructor_id, max_capacity, current_enrollment) 
VALUES (10, 'Quantum Mechanics', 'PH101', 3, 'Fall', 5, 23, 40, 0);

-- ==================== 6. ENROLLMENTS (20 Unique) ====================
DELETE FROM ENROLLMENT;
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (1, 1, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (2, 2, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (3, 3, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (4, 4, 2, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (5, 5, 2, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (6, 6, 3, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (7, 7, 3, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (8, 8, 4, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (9, 9, 5, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (10, 10, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (11, 11, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (12, 12, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (13, 13, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (14, 14, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (15, 15, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (16, 16, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (17, 17, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (18, 18, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (19, 19, 1, SYSDATE, 2024, 'ACTIVE');
INSERT INTO ENROLLMENT (enrollment_id, student_id, course_id, enrollment_date, enrollment_year, status) VALUES (20, 20, 1, SYSDATE, 2024, 'ACTIVE');

-- ==================== 7. GRADES (20 Unique) ====================
DELETE FROM GRADE;
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (1, 1, 95, 'A');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (2, 2, 88, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (3, 3, 72, 'C');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (4, 4, 91, 'A');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (5, 5, 84, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (6, 6, 65, 'D');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (7, 7, 78, 'C');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (8, 8, 92, 'A');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (9, 9, 81, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (10, 10, 89, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (11, 11, 94, 'A');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (12, 12, 76, 'C');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (13, 13, 83, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (14, 14, 90, 'A');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (15, 15, 87, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (16, 16, 74, 'C');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (17, 17, 93, 'A');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (18, 18, 85, 'B');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (19, 19, 79, 'C');
INSERT INTO GRADE (grade_id, enrollment_id, marks, letter_grade) VALUES (20, 20, 96, 'A');

-- ==================== 8. TEST ACCOUNTS (Specified by User) ====================
-- Registrar (Admin)
DELETE FROM APP_USERS WHERE username = 'registrar';
INSERT INTO APP_USERS (user_id, username, password, role, status) VALUES (seq_userid.NEXTVAL, 'registrar', 'registrar123', 'ADMIN', 'ACTIVE');

-- Student 1
DELETE FROM APP_USERS WHERE username = 'STUDENT_1';
INSERT INTO APP_USERS (user_id, username, password, role, ref_id, status) VALUES (seq_userid.NEXTVAL, 'STUDENT_1', '1234', 'STUDENT', 1, 'ACTIVE');

-- Professor 1
DELETE FROM APP_USERS WHERE username = 'PROFESSOR_1';
INSERT INTO APP_USERS (user_id, username, password, role, ref_id, status) VALUES (seq_userid.NEXTVAL, 'PROFESSOR_1', '1234', 'INSTRUCTOR', 21, 'ACTIVE');

COMMIT;
EXIT;
