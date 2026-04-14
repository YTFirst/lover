@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo   Electronic Girlfriend - Tray App
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Starting tray application...
start "" powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "tray\tray.ps1"

echo [SUCCESS] Tray app started
echo [TIP] Right-click tray icon to manage server
echo [TIP] Double-click tray icon to open browser
echo.
pause
