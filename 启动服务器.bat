@echo off
chcp 65001 >nul
echo.
echo ===================================
echo    FitTrack Local Server Launcher
echo ===================================
echo.

cd /d "%~dp0server"

echo Starting server...
echo Server will be available at:
echo   Local: http://localhost:3000
echo   Network: http://172.18.148.13:3000
echo.

node server.js

pause