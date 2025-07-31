@echo off
echo Cleaning up old frontend and documentation files...
echo.

REM Old HTML templates (no longer needed - using React)
echo Deleting old HTML templates...
rmdir /s /q "app\templates" 2>nul
echo - Removed app\templates\

REM Old static files (no longer needed - using React)
echo Deleting old static files...
rmdir /s /q "app\static" 2>nul
echo - Removed app\static\

REM Old Tailwind config files in root
echo Deleting old Tailwind files...
del /q "tailwind.config.js" 2>nul
del /q "tailwind.input.css" 2>nul
echo - Removed old tailwind config files

REM Old test files
echo Deleting old test files...
del /q "tests\test.bat" 2>nul
del /q "tests\test.sh" 2>nul
del /q "test_app.py" 2>nul
echo - Removed old test files

REM Sample/example files
echo Deleting sample files...
del /q "employees_example.csv" 2>nul
echo - Removed sample files

REM All README and documentation files
echo Deleting all README and documentation files...
del /q "README.md" 2>nul
del /q "README_AI.md" 2>nul
del /q "TEMPLATE_SETUP_GUIDE.md" 2>nul
del /q "FRONTEND_MIGRATION_GUIDE.md" 2>nul
rmdir /s /q "docs" 2>nul
del /q "frontend\README.md" 2>nul
echo - Removed all documentation files

REM Debug folder (optional - contains processing debug images)
echo Deleting debug folder...
rmdir /s /q "debug" 2>nul
echo - Removed debug folder

REM Preview folder (temporary files)
echo Deleting preview folder...
rmdir /s /q "previews" 2>nul
echo - Removed previews folder

REM Upload folder (temporary files)
echo Deleting upload folder...
rmdir /s /q "uploads" 2>nul
echo - Removed uploads folder

REM Sample folder (temporary files)
echo Deleting samples folder...
rmdir /s /q "samples" 2>nul
echo - Removed samples folder

echo.
echo ✅ Cleanup completed!
echo.
echo Files that were kept:
echo - app\*.py (all Python backend files)
echo - company_configs\ (your company templates)
echo - config\ (Docker configuration)
echo - frontend\ (new React frontend)
echo - requirements.txt
echo - env.example
echo - .env (if exists)
echo.
echo Ready to proceed with frontend setup!
pause 