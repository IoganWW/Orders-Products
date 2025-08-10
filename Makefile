# Makefile
# Makefile for easy Docker management

.PHONY: dev prod stop clean logs db-reset help

dev: ## Start development environment
	@chmod +x scripts/docker-dev.sh
	@./scripts/docker-dev.sh

prod: ## Start production environment
	@chmod +x scripts/docker-prod.sh
	@./scripts/docker-prod.sh

stop: ## Stop all containers
	@chmod +x scripts/docker-stop.sh
	@./scripts/docker-stop.sh

clean: ## Clean up Docker resources
	@chmod +x scripts/docker-clean.sh
	@./scripts/docker-clean.sh

logs: ## View logs from all services
	@chmod +x scripts/docker-logs.sh
	@./scripts/docker-logs.sh

db-reset: ## Reset database with fresh data
	@chmod +x scripts/docker-db-reset.sh
	@./scripts/docker-db-reset.sh

help: ## Show this help message
	@echo "Orders & Products - Docker Management"
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)