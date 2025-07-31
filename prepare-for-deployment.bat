@echo off
echo.
echo 🚀 ========================================
echo    PREPARING PROJECT FOR DEPLOYMENT
echo ========================================
echo.

echo 📁 Step 1: Organizing project structure...
call scripts\organize-project.bat
if not exist "scripts\organize-project.bat" (
    echo Creating scripts directory...
    mkdir scripts
    echo Moving scripts...
    move "*.bat" "scripts\" 2>nul
)

echo.
echo 🧹 Step 2: Cleaning development files...
call scripts\cleanup-dev-files.bat

echo.
echo 🔍 Step 3: Final structure check...
echo.
echo ✅ Final project structure:
echo.
dir /ad
echo.
echo 📄 Root files:
dir /a-d
echo.

echo ✅ PROJECT READY FOR DEPLOYMENT! 
echo.
echo 🔧 Next steps:
echo 1. Check .env.example and create your .env file
echo 2. git add . && git commit -m "Organize project for deployment"
echo 3. git push origin main
echo 4. Deploy to Railway/Render/etc
echo.
echo 📖 See docs/PRODUCTION_DEPLOYMENT.md for detailed deployment guide
echo.
pause