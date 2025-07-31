@echo off
echo Starting Monthly Paycheck SaaS - Production Environment
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo Please copy env.example to .env and add your OpenRouter API key
    echo.
    pause
    exit /b 1
)

echo 🐳 Building and starting production environment...
echo This will build the React frontend and serve it from the FastAPI backend
echo.

docker-compose -f config/docker-compose.yml up --build

echo.
echo Production environment stopped.
pause 