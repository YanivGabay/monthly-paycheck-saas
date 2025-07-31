@echo off
echo 📁 Organizing project structure for deployment...
echo.

REM Create scripts directory if it doesn't exist
if not exist "scripts" mkdir scripts

REM Move batch scripts to scripts directory
echo Moving development scripts...
move "start-dev.bat" "scripts\" 2>nul
move "start-prod.bat" "scripts\" 2>nul
move "cleanup_old_files.bat" "scripts\cleanup_old_files.bat" 2>nul
move "test_oauth_config.bat" "scripts\" 2>nul
move "test_oauth_config.sh" "scripts\" 2>nul
echo - Moved scripts to scripts/ directory

REM Create docs directory and move documentation
if not exist "docs" mkdir docs
move "PRODUCTION_DEPLOYMENT.md" "docs\" 2>nul
echo - Moved documentation to docs/ directory

REM Ensure proper directory structure exists
echo Creating required directories...
if not exist "uploads" mkdir uploads
if not exist "uploads\processing" mkdir uploads\processing
if not exist "previews" mkdir previews
if not exist "samples" mkdir samples
if not exist "debug" mkdir debug
echo - Created required runtime directories

echo.
echo ✅ Project organization completed!
echo.
echo 📁 Final structure:
echo ├── app/                     (Backend Python code)
echo ├── frontend/                (React frontend)
echo ├── config/                  (Docker configuration) 
echo ├── company_configs/         (Persistent company data)
echo ├── scripts/                 (Development scripts)
echo ├── docs/                    (Documentation)
echo ├── tests/                   (Test files)
echo ├── samples/                 (Sample PDFs - created at runtime)
echo ├── uploads/                 (Temp processing - created at runtime)
echo ├── previews/                (Preview images - created at runtime)
echo └── requirements.txt         (Python dependencies)
echo.
pause