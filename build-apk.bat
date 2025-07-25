@echo off
echo ===================================
echo Coal Management App - APK Builder
echo ===================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Node.js is installed: 
node --version

echo.
echo Checking npm installation...
npm --version

echo.
echo Installing Cordova globally...
call npm install -g cordova

echo.
echo Creating Cordova project...
call cordova create CoalApp com.yourcompany.coalapp "Coal Management App"

echo.
echo Copying your web files to Cordova project...
xcopy /E /I /Y "*.html" "CoalApp\www\"
xcopy /E /I /Y "*.js" "CoalApp\www\"
xcopy /E /I /Y "*.css" "CoalApp\www\"
xcopy /E /I /Y "components" "CoalApp\www\components\"
copy /Y "config.xml" "CoalApp\"

echo.
echo Changing to CoalApp directory...
cd CoalApp

echo.
echo Adding Android platform...
call cordova platform add android

echo.
echo Building APK (Debug version)...
call cordova build android

echo.
echo ===================================
echo BUILD COMPLETE!
echo ===================================
echo.
echo Your APK file is located at:
echo CoalApp\platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on your Android device:
echo 1. Enable Developer Options and USB Debugging
echo 2. Connect your device via USB
echo 3. Run: adb install app-debug.apk
echo.
echo For production build, run: cordova build android --release
echo.
pause
