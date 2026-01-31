@echo off
echo Starting Presidio services...
echo.

REM Start Analyzer
start "Presidio Analyzer" cmd /k "cd presidio-analyzer && python app.py"
timeout /t 3 /nobreak >nul

REM Start Anonymizer
start "Presidio Anonymizer" cmd /k "cd presidio-anonymizer && python app.py"
timeout /t 2 /nobreak >nul

REM Start Frontend
start "Presidio Frontend" cmd /k "cd frontend && python -m http.server 8080"
timeout /t 2 /nobreak >nul

echo.
echo All services started!
echo.
echo Analyzer:    http://localhost:3000
echo Anonymizer:  http://localhost:3001
echo Frontend:    http://localhost:8080
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:8080

pause
