#!/bin/bash
# scripts/docker-db-reset.sh
# Reset database with fresh data

echo "🗄️  Resetting database..."

# Stop only MySQL container
docker-compose stop mysql

# Remove MySQL container and volume
docker-compose rm -f mysql
docker volume rm $(docker-compose config --volumes | grep mysql)

# Restart MySQL with fresh data
docker-compose up -d mysql

echo "✅ Database reset completed"
echo "⏳ Waiting for MySQL to initialize..."
sleep 30

# Restart other services
docker-compose up -d