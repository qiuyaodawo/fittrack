@echo off
chcp 65001 >nul
echo.
echo ===================================
echo    FitTrack 本地服务器启动器
echo ===================================
echo.

cd /d "%~dp0server"

echo 📡 正在启动服务器...
echo 🌐 启动后可通过以下地址访问：
echo    - 本地访问: http://localhost:3000
echo    - 局域网访问: http://172.18.148.13:3000
echo.

node server.js

pause