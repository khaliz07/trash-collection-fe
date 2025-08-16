# Trash Collection Docker Management
.PHONY: help build up down logs clean reset migrate seed backup restore

# Default target
help:
	@echo "Trash Collection Docker Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make logs      - View logs from all services"
	@echo ""
	@echo "Database:"
	@echo "  make migrate   - Run Prisma migrations"
	@echo "  make seed      - Seed database with initial data"
	@echo "  make reset     - Reset database (DANGER!)"
	@echo "  make backup    - Backup database"
	@echo "  make restore   - Restore database from backup"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean     - Remove unused Docker resources"
	@echo "  make prune     - Full Docker system cleanup"
	@echo "  make status    - Show service status"

# Build Docker images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build --no-cache

# Start services
up:
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "✅ Services started! Check status with 'make status'"

# Start with logs
up-logs:
	@echo "🚀 Starting services with logs..."
	docker-compose up

# Stop services
down:
	@echo "🛑 Stopping services..."
	docker-compose down

# Restart services
restart: down up

# View logs
logs:
	docker-compose logs -f

# View specific service logs
logs-app:
	docker-compose logs -f app

logs-db:
	docker-compose logs -f postgres

# Database migration
migrate:
	@echo "🔄 Running database migrations..."
	docker-compose exec app npx prisma migrate deploy
	@echo "✅ Migrations completed!"

# Generate Prisma client
generate:
	@echo "🔄 Generating Prisma client..."
	docker-compose exec app npx prisma generate
	@echo "✅ Prisma client generated!"

# Seed database
seed:
	@echo "🌱 Seeding database..."
	docker-compose exec app npx prisma db seed
	@echo "✅ Database seeded!"

# Reset database (DANGER!)
reset:
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? (y/N) " confirm && [ $$confirm = y ]
	docker-compose down -v
	docker volume rm trash_collection_fe_5_postgres_data || true
	docker-compose up -d postgres
	@echo "⏳ Waiting for database to be ready..."
	sleep 10
	docker-compose up -d app
	make migrate
	make seed
	@echo "✅ Database reset completed!"

# Backup database
backup:
	@echo "💾 Creating database backup..."
	mkdir -p ./backups
	docker-compose exec postgres pg_dump -U trash_user trash_collection > ./backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in ./backups/"

# Restore database from backup
restore:
	@echo "📥 Available backups:"
	@ls -la ./backups/
	@read -p "Enter backup filename: " backup_file; \
	docker-compose exec -T postgres psql -U trash_user -d trash_collection < ./backups/$$backup_file
	@echo "✅ Database restored!"

# Show service status
status:
	@echo "📊 Service Status:"
	docker-compose ps

# Show service health
health:
	@echo "🏥 Health Checks:"
	@docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Clean unused Docker resources
clean:
	@echo "🧹 Cleaning unused Docker resources..."
	docker system prune -f
	docker volume prune -f

# Full cleanup (DANGER!)
prune:
	@echo "⚠️  WARNING: This will remove ALL unused Docker resources!"
	@read -p "Are you sure? (y/N) " confirm && [ $$confirm = y ]
	docker system prune -a -f --volumes

# Development helpers
shell-app:
	docker-compose exec app sh

shell-db:
	docker-compose exec postgres psql -U trash_user -d trash_collection

# Production deployment
deploy-prod:
	@echo "🚀 Deploying to production..."
	docker-compose --profile production up -d

# Monitor resources
monitor:
	docker stats $(shell docker-compose ps -q)
