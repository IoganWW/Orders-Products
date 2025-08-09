# scripts/docker-stop.sh
#!/bin/bash

echo "🛑 Stopping Orders & Products application..."

# Stop all services
docker-compose down

# Optional: Remove volumes
read -p "🗑️  Do you want to remove database data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing volumes..."
    docker-compose down -v
fi

echo "✅ Application stopped successfully!"