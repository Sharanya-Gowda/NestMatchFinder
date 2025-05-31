@echo off
echo Starting NestMatch PG Finder...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists and has valid database URL
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with your database URL
    pause
    exit /b 1
)

REM Check if database URL is configured
findstr /C:"username:password@localhost" .env >nul
if not errorlevel 1 (
    echo.
    echo IMPORTANT: Please edit .env file with your actual database URL
    echo Press any key to open .env file for editing...
    pause >nul
    notepad .env
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting the application...
echo The app will be available at: http://localhost:5000
echo.

REM Start the application
npm run dev
pause