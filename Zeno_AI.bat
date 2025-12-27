@echo off
cd /d "%~dp0"
title Zeno AI
color 0A

echo Starting Zeno AI...
echo.

:: Use the PowerShell script for better reliability
powershell -ExecutionPolicy Bypass -File "start_zeno.ps1"

:: Fallback to batch script if PowerShell fails
if %errorlevel% neq 0 (
    echo PowerShell script failed, using fallback...
    call start_zeno.bat
)