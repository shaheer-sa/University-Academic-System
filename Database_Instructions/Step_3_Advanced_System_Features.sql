-- ============================================================
-- Project : University Enrollment System
-- Script  : Step 3 - Advanced System Features.sql
-- Purpose : PL/SQL Objects (Procedures, Functions, Triggers, Packages)
-- ============================================================

SET SERVEROUTPUT ON;

-- ==================== FUNCTIONS ====================

-- 1. Function to calculate GPA from marks
CREATE OR REPLACE FUNCTION fn_calculate_gpa (p_marks IN NUMBER) RETURN NUMBER IS
BEGIN
    IF p_marks >= 90 THEN RETURN 4.0;
    ELSIF p_marks >= 80 THEN RETURN 3.7;
    ELSIF p_marks >= 70 THEN RETURN 3.0;
    ELSIF p_marks >= 60 THEN RETURN 2.0;
    ELSE RETURN 0.0;
    END IF;
END;
/

-- 2. Function to get student count in a department
CREATE OR REPLACE FUNCTION fn_dept_student_count (p_dept_id IN NUMBER) RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(DISTINCT student_id) INTO v_count
    FROM STUDENT
    WHERE department_id = p_dept_id;
    RETURN v_count;
END;
/

-- ==================== PACKAGE ====================

CREATE OR REPLACE PACKAGE pkg_university AS
    -- Constants
    c_university_name CONSTANT VARCHAR2(50) := 'FAST-NUCES';
    
    -- Procedures
    PROCEDURE proc_add_student(p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_email IN VARCHAR2, p_id OUT NUMBER);
    PROCEDURE proc_enroll_student(p_stu_id IN NUMBER, p_course_id IN NUMBER);
    
    -- Function
    FUNCTION fn_get_university_name RETURN VARCHAR2;
END pkg_university;
/

CREATE OR REPLACE PACKAGE BODY pkg_university AS
    FUNCTION fn_get_university_name RETURN VARCHAR2 IS
    BEGIN
        RETURN c_university_name;
    END;

    PROCEDURE proc_add_student(p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_email IN VARCHAR2, p_id OUT NUMBER) IS
    BEGIN
        INSERT INTO PERSON (first_name, last_name, email) VALUES (p_fname, p_lname, p_email) RETURNING person_id INTO p_id;
        INSERT INTO STUDENT (student_id, enrollment_year) VALUES (p_id, 2024);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN ROLLBACK; RAISE;
    END;

    PROCEDURE proc_enroll_student(p_stu_id IN NUMBER, p_course_id IN NUMBER) IS
    BEGIN
        INSERT INTO ENROLLMENT (student_id, course_id) VALUES (p_stu_id, p_course_id);
        COMMIT;
    END;
END pkg_university;
/

-- ==================== STORED PROCEDURES ====================

-- 1. Procedure with IN and OUT parameters
CREATE OR REPLACE PROCEDURE proc_get_student_info (
    p_stu_id IN NUMBER, 
    p_name OUT VARCHAR2, 
    p_email OUT VARCHAR2
) IS
BEGIN
    SELECT (first_name || ' ' || last_name), email INTO p_name, p_email FROM PERSON WHERE person_id = p_stu_id;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_name := 'NOT FOUND';
        p_email := 'N/A';
END;
/

-- ==================== TRIGGERS ====================

-- 1. BEFORE INSERT: Auto-calculate Letter Grade
CREATE OR REPLACE TRIGGER trg_bi_grade_letter
BEFORE INSERT ON GRADE
FOR EACH ROW
BEGIN
    IF :NEW.marks >= 90 THEN :NEW.letter_grade := 'A';
    ELSIF :NEW.marks >= 80 THEN :NEW.letter_grade := 'B';
    ELSIF :NEW.marks >= 70 THEN :NEW.letter_grade := 'C';
    ELSIF :NEW.marks >= 60 THEN :NEW.letter_grade := 'D';
    ELSE :NEW.letter_grade := 'F';
    END IF;
END;
/

-- 2. AFTER UPDATE: Audit Log for Grade Changes
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE GRADE_AUDIT CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE GRADE_AUDIT (
    audit_id NUMBER PRIMARY KEY,
    grade_id NUMBER,
    old_marks NUMBER,
    new_marks NUMBER,
    change_date DATE
);

CREATE SEQUENCE seq_auditid START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE OR REPLACE TRIGGER trg_bi_grade_audit
BEFORE INSERT ON GRADE_AUDIT
FOR EACH ROW
BEGIN
    SELECT seq_auditid.NEXTVAL INTO :NEW.audit_id FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER trg_au_grade_audit
AFTER UPDATE OF marks ON GRADE
FOR EACH ROW
BEGIN
    INSERT INTO GRADE_AUDIT (grade_id, old_marks, new_marks, change_date)
    VALUES (:OLD.grade_id, :OLD.marks, :NEW.marks, SYSDATE);
END;
/

-- 3. AFTER DELETE: Archive Deleted Students
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE STUDENT_ARCHIVE CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE STUDENT_ARCHIVE (
    student_id NUMBER,
    deleted_date DATE
);

CREATE OR REPLACE TRIGGER trg_ad_student_archive
AFTER DELETE ON STUDENT
FOR EACH ROW
BEGIN
    INSERT INTO STUDENT_ARCHIVE (student_id, deleted_date) VALUES (:OLD.student_id, SYSDATE);
END;
/

-- ==================== CURSORS ====================

-- 1. Explicit Parameterized Cursor
CREATE OR REPLACE PROCEDURE proc_print_dept_courses (p_dept_id IN NUMBER) IS
    CURSOR cur_courses(cp_dept_id NUMBER) IS 
        SELECT course_name FROM COURSE WHERE department_id = cp_dept_id;
    v_name COURSE.course_name%TYPE;
BEGIN
    OPEN cur_courses(p_dept_id);
    LOOP
        FETCH cur_courses INTO v_name;
        EXIT WHEN cur_courses%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE('Course: ' || v_name);
    END LOOP;
    CLOSE cur_courses;
END;
/

-- ==================== ANONYMOUS BLOCKS ====================

-- Block 1: Using IF/LOOP and Exception
DECLARE
    v_total NUMBER;
BEGIN
    FOR rec IN (SELECT department_id FROM DEPARTMENT) LOOP
        v_total := fn_dept_student_count(rec.department_id);
        IF v_total > 5 THEN
            DBMS_OUTPUT.PUT_LINE('Dept ' || rec.department_id || ' is large.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Dept ' || rec.department_id || ' is small.');
        END IF;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('Error in summary block.');
END;
/

COMMIT;
EXIT;
