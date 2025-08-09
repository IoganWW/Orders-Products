
@echo off
echo 🛑 Stopping Orders and Products Application...

docker-compose down

if %errorlevel% equ 0 (
    echo ✅ Application stopped successfully!
) else (
    echo ❌ Failed to stop application
)

pause