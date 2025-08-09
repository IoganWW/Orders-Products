@echo off
echo 🚀 Starting Orders and Products Application...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo 📦 Building and starting containers...

docker-compose up -d

if %errorlevel% equ 0 (
    echo ✅ Application started successfully!
    echo 🌐 Frontend: http://localhost:3000
    echo 🔧 Backend: http://localhost:3001
    echo 🗄️ Database: localhost:3306
    echo 🌍 Full app via Nginx: http://localhost
    echo.
    echo 📊 To view logs: docker-compose logs -f
    echo 🛑 To stop: docker-compose down
) else (
    echo ❌ Failed to start application
)

pause