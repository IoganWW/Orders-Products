#!/bin/bash
# scripts/docker-prod.sh
# Production mode script

echo "🚀 Starting Orders & Products in Production mode..."

# Stop any existing containers
docker-compose down

# Build and start production environment
docker-compose --profile production up --build -d

echo "✅ Application started in production mode"
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/api"
echo "🗄️  Database: localhost:3306"