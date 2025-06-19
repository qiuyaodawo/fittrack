@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    FitTrack Demo Data Initialization
echo ========================================
echo.

:: Run demo data initialization
echo Starting demo data initialization...
echo.
node init-demo-data.js

if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to initialize demo data!
    echo Please check if Node.js is installed and init-demo-data.js exists.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo        Initialization Complete!
echo ========================================
echo.
echo Demo Account Information:
echo    Email: demo@fittrack.com
echo    Password: demo123
echo.
echo Note: Demo data only needs to be initialized once.
echo You can now start the server directly.
echo.
pause
