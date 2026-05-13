-- ============================================================
-- Project : University Enrollment System
-- Script  : 03_ddl_schema.sql
-- Group   : Group XX
-- Members : Shaheer Chaudhary, Partner Name
-- Date    : 2026-05-10
-- Purpose : DDL - Create all tables with constraints, indexes, and views
-- ============================================================

SET SERVEROUTPUT ON;

-- ==================== DROP EXISTING OBJECTS ====================
BEGIN
    FOR t IN (SELECT table_name FROM user_tables WHERE table_name NOT LIKE 'DEF$_%' AND table_name NOT LIKE 'REPCAT$_%') LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
    FOR s IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    END LOOP;
END;
/

-- ==================== SEQUENCES ====================
CREATE SEQUENCE seq_personid   START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_departmentid START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_instructorid START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_programid    START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_studentid    START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_courseid     START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_enrollmentid START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_examid       START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_gradeid      START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_userid       START WITH 1 INCREMENT BY 1 NOCACHE;

-- ==================== TABLES ====================

-- Table: PERSON
CREATE TABLE PERSON (
    person_id    NUMBER        CONSTRAINT pk_person PRIMARY KEY,
    first_name   VARCHAR2(50)  CONSTRAINT nn_person_fname NOT NULL,
    last_name    VARCHAR2(50)  CONSTRAINT nn_person_lname NOT NULL,
    phone        VARCHAR2(15),
    email        VARCHAR2(100) CONSTRAINT uq_person_email UNIQUE,
    dob          DATE          DEFAULT SYSDATE,
    address      VARCHAR2(200)
);

-- Table: DEPARTMENT
CREATE TABLE DEPARTMENT (
    department_id   NUMBER        CONSTRAINT pk_department PRIMARY KEY,
    department_name VARCHAR2(100) CONSTRAINT nn_dept_name NOT NULL,
    location        VARCHAR2(100)
);

-- Table: INSTRUCTOR
CREATE TABLE INSTRUCTOR (
    instructor_id NUMBER        CONSTRAINT pk_instructor PRIMARY KEY,
    hire_date     DATE          CONSTRAINT nn_inst_hire NOT NULL,
    rank          VARCHAR2(50),
    qualification VARCHAR2(100),
    specialization VARCHAR2(100),
    office_location VARCHAR2(100),
    department_id NUMBER,
    status        VARCHAR2(20)  DEFAULT 'ACTIVE',
    CONSTRAINT fk_inst_person FOREIGN KEY (instructor_id) REFERENCES PERSON(person_id) ON DELETE CASCADE,
    CONSTRAINT fk_inst_dept   FOREIGN KEY (department_id) REFERENCES DEPARTMENT(department_id)
);

-- Table: STUDENT
CREATE TABLE STUDENT (
    student_id    NUMBER        CONSTRAINT pk_student PRIMARY KEY,
    enrollment_year NUMBER(4)   CONSTRAINT nn_stu_year NOT NULL,
    enrollment_date DATE        DEFAULT SYSDATE,
    status        VARCHAR2(20)  DEFAULT 'ACTIVE',
    department_id NUMBER,
    gpa           NUMBER(3,2)   DEFAULT 0,
    total_credits NUMBER(3)    DEFAULT 0,
    CONSTRAINT fk_stu_person FOREIGN KEY (student_id) REFERENCES PERSON(person_id) ON DELETE CASCADE,
    CONSTRAINT fk_stu_dept   FOREIGN KEY (department_id) REFERENCES DEPARTMENT(department_id)
);

-- Table: COURSE
CREATE TABLE COURSE (
    course_id    NUMBER        CONSTRAINT pk_course PRIMARY KEY,
    course_name  VARCHAR2(150) CONSTRAINT nn_course_name NOT NULL,
    course_code  VARCHAR2(20)  UNIQUE,
    credits      NUMBER(2)     CONSTRAINT chk_course_credits CHECK (credits > 0),
    semester     VARCHAR2(20),
    description  VARCHAR2(500),
    max_capacity NUMBER(3),
    current_enrollment NUMBER(3) DEFAULT 0,
    instructor_id NUMBER,
    department_id NUMBER,
    status       VARCHAR2(20)  DEFAULT 'ACTIVE',
    CONSTRAINT fk_course_dept FOREIGN KEY (department_id) REFERENCES DEPARTMENT(department_id),
    CONSTRAINT fk_course_inst FOREIGN KEY (instructor_id) REFERENCES INSTRUCTOR(instructor_id)
);

-- Table: ENROLLMENT
CREATE TABLE ENROLLMENT (
    enrollment_id   NUMBER        CONSTRAINT pk_enrollment PRIMARY KEY,
    student_id      NUMBER        NOT NULL,
    course_id       NUMBER        NOT NULL,
    enrollment_date DATE          DEFAULT SYSDATE,
    enrollment_year NUMBER(4),
    status          VARCHAR2(20)  DEFAULT 'ACTIVE' CONSTRAINT chk_enr_status CHECK (status IN ('ACTIVE','DROPPED','COMPLETED')),
    CONSTRAINT fk_enr_stu    FOREIGN KEY (student_id)    REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_enr_course FOREIGN KEY (course_id)     REFERENCES COURSE(course_id) ON DELETE CASCADE,
    CONSTRAINT uq_enroll     UNIQUE (student_id, course_id)
);

-- Table: GRADE
CREATE TABLE GRADE (
    grade_id      NUMBER        CONSTRAINT pk_grade PRIMARY KEY,
    enrollment_id NUMBER        NOT NULL,
    marks         NUMBER(5,2),
    created_date  DATE          DEFAULT SYSDATE,
    letter_grade  VARCHAR2(5),
    CONSTRAINT fk_grade_enroll FOREIGN KEY (enrollment_id) REFERENCES ENROLLMENT(enrollment_id) ON DELETE CASCADE
);

-- Table: APP_USERS
CREATE TABLE APP_USERS (
    user_id      NUMBER        CONSTRAINT pk_users PRIMARY KEY,
    username     VARCHAR2(50)  CONSTRAINT uq_user_name UNIQUE NOT NULL,
    password     VARCHAR2(100) NOT NULL,
    role         VARCHAR2(20)  CHECK (role IN ('ADMIN', 'INSTRUCTOR', 'STUDENT')),
    ref_id       NUMBER,
    status       VARCHAR2(20)  DEFAULT 'ACTIVE'
);

-- ==================== INDEXES ====================
CREATE INDEX idx_person_fname ON PERSON(first_name);
CREATE INDEX idx_person_lname ON PERSON(last_name);
CREATE INDEX idx_course_name ON COURSE(course_name);

-- ==================== VIEWS ====================
CREATE OR REPLACE VIEW vw_grade_report AS
SELECT g.grade_id, (p.first_name || ' ' || p.last_name) AS student_name, c.course_name, g.marks, g.letter_grade
FROM GRADE g
JOIN ENROLLMENT e ON g.enrollment_id = e.enrollment_id
JOIN STUDENT s ON e.student_id = s.student_id
JOIN PERSON p ON s.student_id = p.person_id
JOIN COURSE c ON e.course_id = c.course_id;

CREATE OR REPLACE VIEW vw_dept_summary AS
SELECT d.department_name, COUNT(c.course_id) AS total_courses
FROM DEPARTMENT d
LEFT JOIN COURSE c ON d.department_id = c.department_id
GROUP BY d.department_name;

-- ==================== SEED ADMIN ====================
INSERT INTO APP_USERS (user_id, username, password, role, status)
VALUES (seq_userid.NEXTVAL, 'ADMIN', 'admin123', 'ADMIN', 'ACTIVE');

COMMIT;
EXIT;
