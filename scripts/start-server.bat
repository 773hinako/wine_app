@echo off
chcp 65001 > nul
cls
echo ==========================================
echo   Wine Record App Server
echo ==========================================
echo.
echo Starting server...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Server started!
echo.
echo [ACCESS URLs]
echo  - From PC: http://localhost:8000
echo  - From smartphone: http://%IP%:8000
echo.
echo Press Ctrl+C to stop
echo ==========================================
echo.

python -m http.server 8000 --bind 0.0.0.0
