# scripts/docker-reset.sh
#!/bin/bash

echo "🔄 Resetting Orders & Products application..."

# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean up
docker system prune -f

echo "✅ Application reset complete!"
echo "Run ./scripts/docker-start.sh to start fresh"

# Makefile для удобства
# Makefile
.PHONY: start stop logs reset build health

start:
	@chmod +x scripts/docker-start.sh
	@./scripts/docker-start.sh

stop:
	@chmod +x scripts/docker-stop.sh
	@./scripts/docker-stop.sh

logs:
	@chmod +x scripts/docker-logs.sh
	@./scripts/docker-logs.sh

reset:
	@chmod +x scripts/docker-reset.sh
	@./scripts/docker-reset.sh

build:
	docker-compose build --no-cache

health:
	docker-compose ps
	@echo ""
	@echo "🏥 Health checks:"
	@curl -s http://localhost:3001/api/health || echo "❌ Server not ready"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Client ready" || echo "❌ Client not ready"

dev:
	docker-compose -f docker-compose.dev.yml up

prod:
	docker-compose -f docker-compose.yml up -d