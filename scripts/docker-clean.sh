#!/bin/bash
# scripts/docker-clean.sh
# Clean up Docker resources

echo "🧹 Cleaning up Docker resources..."

# Stop all containers
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Remove containers, networks, and images
docker-compose down --rmi all --volumes --remove-orphans

# Remove unused Docker resources
docker system prune -f

echo "✅ Docker cleanup completed"