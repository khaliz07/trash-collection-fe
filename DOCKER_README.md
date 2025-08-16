# 🐳 Docker Setup cho Trash Collection App

## Quick Start

```bash
# 1. Copy environment file
cp .env.docker .env.local

# 2. Build và start services
make build
make up

# 3. Run database migrations
make migrate

# 4. Seed initial data
make seed

# 5. Check status
make status
```

App sẽ chạy tại: **http://localhost:3000**

## 📋 Services

### Application Stack

- **🖥️ App**: Next.js on port 3000
- **🗄️ PostgreSQL**: Database on port 2345 (external), 5432 (internal)
- **🌐 Nginx**: Proxy on port 80 (optional)

### Service URLs

- **Application**: http://localhost:3000
- **Database**: postgresql://trash_user:trash_password_2024@localhost:2345/trash_collection
- **Health Check**: http://localhost:3000/api/health

## 🛠️ Available Commands

### Development

```bash
make build      # Build Docker images
make up         # Start all services
make down       # Stop all services
make restart    # Restart services
make logs       # View all logs
make status     # Service status
make health     # Health checks
```

### Database Management

```bash
make migrate    # Run Prisma migrations
make generate   # Generate Prisma client
make seed       # Seed database
make reset      # Reset database (⚠️ DANGER!)
make backup     # Backup database
make restore    # Restore from backup
```

### Debugging

```bash
make logs-app   # App logs only
make logs-db    # Database logs only
make shell-app  # Shell into app container
make shell-db   # PostgreSQL shell
```

### Maintenance

```bash
make clean      # Clean unused resources
make prune      # Full cleanup (⚠️ DANGER!)
make monitor    # Monitor resource usage
```

## 🔧 Configuration

### Environment Variables

Cập nhật `.env.local` với các giá trị của bạn:

```env
# Database (for external access from host)
DATABASE_URL="postgresql://trash_user:trash_password_2024@localhost:2345/trash_collection?schema=public"

# Security (⚠️ CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# External APIs
GOOGLE_MAPS_API_KEY="your-api-key"
```

### Volume Mounts

- `postgres_data`: Database persistence
- `app_logs`: Application logs

## 🚀 Production Deployment

### With Nginx (Recommended)

```bash
make deploy-prod  # Start với Nginx proxy
```

### Environment Security

1. Thay đổi tất cả secrets trong `.env.local`
2. Sử dụng strong passwords cho database
3. Enable SSL certificates cho Nginx
4. Configure firewall rules

### SSL Setup (Production)

```bash
# Tạo thư mục SSL
mkdir -p docker/ssl

# Copy certificates
cp your-cert.crt docker/ssl/
cp your-key.key docker/ssl/

# Update nginx.conf với SSL config
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check database status
make logs-db

# Reset database
make reset

# Manual connection test
make shell-db
```

### App Not Starting

```bash
# Check app logs
make logs-app

# Rebuild app
docker-compose build app --no-cache
make restart
```

### Port Conflicts

Nếu ports đã được sử dụng, sửa trong `docker-compose.yml`:

```yaml
ports:
  - "3001:3000" # App
  - "2346:5432" # PostgreSQL (if 2345 is also taken)
```

### Memory Issues

```bash
# Check resource usage
make monitor

# Increase Docker memory limits
# Docker Desktop > Settings > Resources > Memory
```

## 📊 Monitoring

### Health Checks

- App: http://localhost:3000/api/health
- Database: Automatic PostgreSQL health check

### Logs

```bash
# Real-time logs
make logs

# Specific service
make logs-app
make logs-db
```

### Performance

```bash
# Resource monitoring
make monitor

# Service status
make health
```

## 🔄 Data Management

### Backup Strategy

```bash
# Manual backup
make backup

# Automated backup (add to crontab)
0 2 * * * cd /path/to/app && make backup
```

### Migration Workflow

```bash
# 1. Stop app
make down

# 2. Backup data
make backup

# 3. Update code
git pull

# 4. Rebuild
make build

# 5. Start services
make up

# 6. Run migrations
make migrate
```

## 📁 Directory Structure

```
trash_collection/
├── docker/
│   ├── Dockerfile          # Multi-stage build
│   ├── init-db.sql        # Database initialization
│   └── nginx.conf         # Nginx configuration
├── docker-compose.yml     # Service orchestration
├── Makefile              # Command shortcuts
├── .env.docker           # Environment template
├── .dockerignore         # Build optimization
└── healthcheck.js        # Health check script
```

## 🎯 Next Steps

1. **Security Review**: Thay đổi tất cả default passwords
2. **SSL Setup**: Configure HTTPS cho production
3. **Monitoring**: Setup logging và monitoring tools
4. **Backup**: Configure automated backup strategy
5. **CI/CD**: Setup deployment pipeline
6. **Scaling**: Configure load balancing if needed

Happy coding! 🚀
