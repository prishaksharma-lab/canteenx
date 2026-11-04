@echo off
title CanteenX - Smart Canteen & Queue Management System
cd /d "%~dp0"
echo ====================================================================
echo   CanteenX - Smart Canteen Ordering & Queue Management System
echo ====================================================================
echo.
echo Starting local Python server at http://localhost:8000 ...
start "" "http://localhost:8000"
python server.py
pause
