@echo off
echo 🧹 Cleaning up development files for production deployment...
echo.

REM Clean temporary processing files
echo Cleaning temporary processing files...
rmdir /s /q "uploads" 2>nul
rmdir /s /q "debug" 2>nul
rmdir /s /q "previews" 2>nul
echo - Removed temporary upload/debug/preview files

REM Clean Python cache
echo Cleaning Python cache...
rmdir /s /q "__pycache__" 2>nul
rmdir /s /q "app\__pycache__" 2>nul
rmdir /s /q "app\services\__pycache__" 2>nul
echo - Removed Python cache files

REM Clean test files (keep OAuth test infrastructure)
echo Cleaning development test files...
del /q "test_google_direct.html" 2>nul
del /q "workers.csv" 2>nul
del /q "pdf example.pdf" 2>nul
echo - Removed temporary test files

REM Keep important test infrastructure
echo.
echo ✅ Cleanup completed! Kept important files:
echo - OAuth test scripts (test_oauth_config.*)
echo - Company configurations (company_configs/)
echo - Sample PDFs (samples/)
echo - Configuration files (config/)
echo - Frontend build (frontend/)
echo.
echo Ready for deployment! 🚀
pause