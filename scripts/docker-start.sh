# scripts/docker-start.sh
#!/bin/bash

echo "🚀 Starting Orders & Products application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
mkdir -p database
mkdir -p nginx
mkdir -p server/logs

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "🔄 Do you want to rebuild images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔨 Rebuilding images..."
    docker-compose build --no-cache
fi

# Start all services
echo "🏗️  Starting all services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ Application started successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🐬 Database: localhost:3306"
echo "🌐 Nginx: http://localhost:80"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"