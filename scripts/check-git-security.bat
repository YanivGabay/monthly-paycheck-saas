@echo off
echo 🔐 ========================================
echo    GIT SECURITY CHECK - BEFORE COMMIT
echo ========================================
echo.

echo 🔍 Checking for sensitive files that might be accidentally committed...
echo.

REM Check if .env files exist in staging
git status --porcelain | findstr "\.env" > nul
if %errorlevel% equ 0 (
    echo ❌ DANGER: .env files found in git staging!
    git status --porcelain | findstr "\.env"
    echo.
    echo 🚨 NEVER commit .env files! They contain secrets.
    echo Run: git reset HEAD .env
    echo.
    set /a error_count+=1
) else (
    echo ✅ No .env files in staging
)

REM Check if company_configs JSON files exist in staging  
git status --porcelain | findstr "company_configs.*\.json" > nul
if %errorlevel% equ 0 (
    echo ❌ DANGER: Company configuration files found in git staging!
    git status --porcelain | findstr "company_configs"
    echo.
    echo 🚨 NEVER commit company configs! They contain personal data.
    echo Run: git reset HEAD company_configs/
    echo.
    set /a error_count+=1
) else (
    echo ✅ No company config files in staging
)

REM Check if CSV files exist in staging
git status --porcelain | findstr "\.csv" > nul
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: CSV files found in git staging!
    git status --porcelain | findstr "\.csv"
    echo.
    echo 💡 CSV files may contain employee data. Review carefully.
    echo.
    set /a warning_count+=1
) else (
    echo ✅ No CSV files in staging
)

REM Check if PDF files exist in staging
git status --porcelain | findstr "\.pdf" > nul
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: PDF files found in git staging!
    git status --porcelain | findstr "\.pdf"
    echo.
    echo 💡 PDF files may contain real payslip data. Review carefully.
    echo.
    set /a warning_count+=1
) else (
    echo ✅ No PDF files in staging
)

echo.
echo 📊 Security scan complete!

if defined error_count (
    echo.
    echo 🚨 CRITICAL ERRORS FOUND! DO NOT COMMIT!
    echo Fix the issues above before committing.
    echo.
    exit /b 1
) else (
    if defined warning_count (
        echo.
        echo ⚠️  Warnings found - review carefully before committing.
        echo.
    ) else (
        echo.
        echo ✅ All security checks passed! Safe to commit.
        echo.
    )
    exit /b 0
)