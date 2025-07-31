@echo off
echo Starting Monthly Paycheck SaaS - Development Environment
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo Please copy env.example to .env and add your OpenRouter API key
    echo.
    pause
    exit /b 1
)

echo 🐳 Starting backend (Docker)...
start "Backend" cmd /k "docker-compose -f config/docker-compose.dev.yml up --build"

echo ⏳ Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo 📱 Starting frontend (React + Vite)...
start "Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ✅ Development environment starting!
echo.
echo Access points:
echo - React Frontend: http://localhost:3000
echo - API Backend: http://localhost:8000  
echo - API Documentation: http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause >nul 