@echo off
echo ==============================
echo PWA Local Testing Server
echo ==============================
echo.
echo Starting local server...
echo Your app will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ==============================
echo.

python -m http.server 8000
