@echo off
title Zeno AI - Startup Manager
color 0A

echo ========================================
echo    Zeno AI - Automatic Startup
echo ========================================
echo.

:: Check if Ollama is installed
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Ollama not found! Please install from https://ollama.ai/download
    echo.
    pause
    exit /b 1
)

:: Kill any existing processes to avoid conflicts
echo 🔄 Cleaning up existing processes...
taskkill /F /IM python.exe >nul 2>nul
taskkill /F /IM ollama.exe >nul 2>nul
timeout /t 2 >nul

:: Start Ollama service
echo 🚀 Starting Ollama service...
start /B "Ollama Service" ollama serve
timeout /t 5

:: Check if required model exists
echo 🔍 Checking for optimized model...
ollama list | findstr "llama3.2:1b" >nul
if %errorlevel% neq 0 (
    echo 📥 Installing optimized model for low-end PCs...
    ollama pull llama3.2:1b
)

:: Start backend
echo 🐍 Starting Python backend...
cd backend
start /B "Zeno Backend" python main.py
cd ..

:: Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 8

:: Check if backend is running
curl -s http://127.0.0.1:8765/health >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Backend failed to start! Check Python dependencies.
    echo Run: pip install -r backend/requirements.txt
    pause
    exit /b 1
)

:: Start frontend
echo 🌐 Starting frontend...
cd frontend
start /B "Zeno Frontend" npm run dev
cd ..

echo.
echo ✅ Zeno AI is starting up!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://127.0.0.1:8765
echo 🤖 Ollama: http://localhost:11434
echo.
echo Press any key to open Zeno in your browser...
pause >nul

:: Open browser
start http://localhost:5173

echo.
echo 🎉 Zeno AI is now running!
echo.
echo To stop all services, close this window or press Ctrl+C
echo.
pause