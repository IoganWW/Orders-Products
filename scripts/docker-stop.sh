#!/bin/bash
# scripts/docker-stop.sh
# Stop all containers

echo "🛑 Stopping Orders & Products containers..."

# Stop all containers
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "✅ All containers stopped"
