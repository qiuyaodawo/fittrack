@echo off
chcp 65001 >nul
echo.
echo ===================================
echo    FitTrack 本地服务器启动器
echo ===================================
echo.

cd /d "%~dp0server"

echo 正在启动服务器...
echo.

node server.js

pause