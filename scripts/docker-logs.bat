@echo off

if "%1"=="" (
    echo 📋 Showing logs for all services...
    docker-compose logs -f
) else (
    echo 📋 Showing logs for %1...
    docker-compose logs -f %1
)