@echo off
echo Starting all services...
echo.

echo Starting Auth Service (Port 3002)...
start "Auth Service" cmd /k "cd auth-service && ..\\.venv\\Scripts\\activate && python app.py"
timeout /t 3 /nobreak > nul

echo Starting Analyzer Service (Port 3000)...
start "Analyzer Service" cmd /k "cd presidio-analyzer && ..\\.venv\\Scripts\\activate && python app.py"
timeout /t 3 /nobreak > nul

echo Starting Anonymizer Service (Port 3001)...
start "Anonymizer Service" cmd /k "cd presidio-anonymizer && ..\\.venv\\Scripts\\activate && python app.py"
timeout /t 3 /nobreak > nul

echo Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd frontend-react && npm run dev"

echo.
echo All services are starting...
echo Auth Service: http://localhost:3002
echo Analyzer Service: http://localhost:3000
echo Anonymizer Service: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
