#!/bin/bash
# scripts/docker-dev.sh
# Development mode script

echo "🚀 Starting Orders & Products in Development mode..."

# Stop any existing containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Build and start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build