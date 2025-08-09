@echo off
echo 🔄 Resetting Orders & Products application...

REM Stop and remove everything
docker-compose down -v

REM Remove all images
docker-compose down --rmi all

REM Clean up
docker system prune -f

echo ✅ Application reset complete!
echo Run scripts\docker-start.bat to start fresh
pause