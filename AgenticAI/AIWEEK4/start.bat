@echo off
REM start.bat - Windows startup script for ResearchAI Agent

echo 🚀 Starting ResearchAI Agent...
echo.

IF "%GROQ_API_KEY%"=="" (
    echo ⚠️  GROQ_API_KEY not set!
    echo Get your free key at: https://console.groq.com
    echo Then run: set GROQ_API_KEY=your_key_here
    echo.
)

echo Starting backend on port 8000...
start "ResearchAI Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend on port 5173...
start "ResearchAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers starting!
echo 👉 Open http://localhost:5173 in your browser
echo.
pause
