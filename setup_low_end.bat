@echo off
echo ========================================
echo    Zeno AI - Low-End PC Setup
echo ========================================
echo.

echo Installing optimized AI model for low-end PCs...
ollama pull llama3.2:1b

echo.
echo Setting up Python dependencies...
cd backend
pip install -r requirements.txt

echo.
echo Setting up frontend dependencies...
cd ../frontend
npm install

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Run: npm run dev (in frontend folder)
echo 2. Run: python main.py (in backend folder)
echo.
echo For ultra low-end PCs, consider using:
echo - ollama pull phi3:mini (even smaller model)
echo.
echo Check LOW_END_PC_OPTIMIZATION.md for more tips!
echo.
pause