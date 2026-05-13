@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo   🎓 UNIVERSITY SYSTEM - DATABASE REBUILD TOOL
echo ===================================================
echo.
echo This tool will reset and rebuild your Oracle database tables.
echo.

set /p DB_USER="Enter Oracle Username (e.g. SYSTEM): "
set /p DB_PASS="Enter Oracle Password: "
set /p DB_CONN="Enter Connection String (e.g. localhost:1521/xe): "

echo.
echo ⏳ Starting Rebuild Process...
echo.

:: Run the SQL files in sequence
echo [1/4] Creating Table Structure...
sqlplus %DB_USER%/%DB_PASS%@%DB_CONN% @"Database_Instructions\Step_1_Create_Table_Structure.sql"

echo [2/4] Adding Sample Records...
sqlplus %DB_USER%/%DB_PASS%@%DB_CONN% @"Database_Instructions\Step_2_Add_Sample_Records.sql"

echo [3/4] Implementing Advanced Features (Triggers/Procedures)...
sqlplus %DB_USER%/%DB_PASS%@%DB_CONN% @"Database_Instructions\Step_3_Advanced_System_Features.sql"

echo [4/4] Running Verification Queries...
sqlplus %DB_USER%/%DB_PASS%@%DB_CONN% @"Database_Instructions\Step_4_Example_Search_Queries.sql"

echo.
echo ===================================================
echo   ✅ DATABASE REBUILD COMPLETE!
echo ===================================================
echo.
pause
