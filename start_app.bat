@echo off
cd /d "%~dp0"
echo ========================================================
echo  Starting GrowWise - AI Behavioral Learning Platform
echo ========================================================
echo Starting Backend on http://localhost:8000 ...
start "Habit Tracker - Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend on http://localhost:5173 ...
start "Habit Tracker - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Application launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ========================================================
