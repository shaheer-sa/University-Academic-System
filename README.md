# 🎓 University Management System

A professional, easy-to-manage database application built for the Semester Project.

## 📁 System Folder Guide

I have renamed all folders to be easily understandable:

```
/University System/
├── Database_Instructions/    # Step-by-step SQL files to setup your database
├── System_Screens/          # All the visual pages (Students, Grades, etc.)
├── System_Navigation/       # The "brains" behind the menu links
├── System_Settings/         # Database connection and password settings
├── Login_Security/          # Handles user login and protection
├── MASTER_DATABASE_REBUILD.bat # One-click tool to reset your database
└── app.js                   # The main program to start the system
```

## 🛠️ How to Rebuild the Database

**Is it required to rebuild the database?**  
Yes, because I have upgraded the database structure to be 100% compliant with the project requirements (using the required naming conventions like `student_id` and `first_name`).

**How to do it easily:**
1.  Double-click `MASTER_DATABASE_REBUILD.bat`.
2.  Enter your Oracle username (usually `SYSTEM` or your project user).
3.  Enter your password.
4.  Enter the connection string (e.g., `localhost:1521/xe`).
5.  Wait for the "Complete!" message.

## 🚀 How to Run the System

1.  Make sure your Oracle database is running.
2.  Open your terminal in this folder.
3.  Type `npm start`.
4.  Open `http://localhost:3000` in your browser.

## 👤 Login Credentials (Testing)
| User Type | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `ADMIN` | `admin123` |
| **Instructor** | `PROF_21` | `prof21123` |
| **Student** | `STUDENT_1` | `stud1123` |

---
**Status**: Managed, Reorganized, and Fully Compliant.
