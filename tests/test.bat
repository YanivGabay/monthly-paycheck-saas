@echo off
REM Monthly Paycheck SaaS - Test Runner (Windows)
echo 🚀 Monthly Paycheck SaaS - Hebrew Name Extraction Test
echo =================================================

if "%1"=="" goto all
if "%1"=="validate" goto validate
if "%1"=="app" goto app
if "%1"=="all" goto all
if "%1"=="help" goto help
if "%1"=="-h" goto help
if "%1"=="--help" goto help

echo ❌ Unknown command: %1
echo Run 'test.bat help' for usage information
exit /b 1

:validate
echo 🔍 Step 1: Running environment validation...
docker-compose -f "%~dp0..\config\docker-compose.test.yml" run --rm test
if %errorlevel% neq 0 (
    echo ❌ Environment validation failed!
    exit /b 1
) else (
    echo ✅ Environment validation passed!
)
goto :eof

:app
echo 🌐 Step 2: Starting web application...
echo Open your browser to: http://localhost:8000
echo Upload your own PDF file to test the system
echo Press Ctrl+C to stop the application
echo.
docker-compose -f "%~dp0..\config\docker-compose.test.yml" --profile app up --build
goto :eof

:all
call :validate
if %errorlevel% neq 0 (
    echo ❌ Validation failed. Please fix the issues above before continuing.
    exit /b 1
)

echo.
echo 🎉 Ready to test! Starting the application...
echo    - Test basic name extraction: http://localhost:8000/test-names
echo    - Upload your PDF for testing: http://localhost:8000
echo.
call :app
goto :eof

:help
echo Usage: test.bat [command]
echo.
echo Commands:
echo   all       Run validation and start app (default)
echo   validate  Only run environment validation
echo   app       Only start the web application
echo   help      Show this help message
echo.
echo Examples:
echo   test.bat              # Run validation and start app
echo   test.bat validate     # Just check if everything is set up
echo   test.bat app          # Just start the web app
echo.
echo Note: Bring your own PDF file for testing!
goto :eof 