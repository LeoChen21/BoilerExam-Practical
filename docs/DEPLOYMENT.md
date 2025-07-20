# Deployment Guide

## Docker Compose Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB available RAM
- At least 5GB available disk space

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd boilerexam

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Service Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MinIO Console**: http://localhost:9001 (admin/admin123)
- **PostgreSQL**: localhost:5432 (postgres/password)

## Environment Configuration

### Environment Variables

#### Backend Configuration
```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/boilerexam

# MinIO Object Storage
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=pdfs
```

#### Frontend Configuration
```bash
# API URL
REACT_APP_API_URL=http://localhost:5000
```

### Production Environment Variables
```bash
# Production Database
DATABASE_URL=postgresql://user:password@prod-db:5432/boilerexam

# Production MinIO
MINIO_ENDPOINT=prod-minio:9000
MINIO_ACCESS_KEY=production-key
MINIO_SECRET_KEY=production-secret

# Production Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

## Service Configuration

### PostgreSQL Setup
The PostgreSQL service automatically:
- Creates the `boilerexam` database
- Sets up the required user credentials
- Persists data in Docker volume `postgres_data`

### MinIO Setup
The MinIO service automatically:
- Creates the required bucket on startup
- Configures access credentials
- Persists data in Docker volume `minio_data`
- Exposes management console on port 9001

### Backup Strategy

#### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres boilerexam > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres boilerexam < backup.sql
```

#### MinIO Backup
```bash
# Backup MinIO data
docker-compose exec minio mc mirror /data /backup

# Or use volume backup
docker run --rm -v boilerexam_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

## Production Deployment

### Security Hardening
1. **Change Default Credentials**
   ```yaml
   environment:
     - POSTGRES_PASSWORD=secure-random-password
     - MINIO_ROOT_PASSWORD=secure-random-password
   ```

2. **Use Environment Files**
   ```bash
   # Create .env file
   cat > .env << EOF
   POSTGRES_PASSWORD=your-secure-password
   MINIO_ROOT_PASSWORD=your-secure-password
   DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/boilerexam
   EOF
   ```

3. **Enable HTTPS**
   - Use reverse proxy (nginx, traefik)
   - Configure SSL certificates
   - Update CORS settings

### Reverse Proxy Configuration (nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Monitoring and Health Checks

### Health Check Configuration
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Log Management
```bash
# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs minio

# Follow logs in real-time
docker-compose logs -f --tail=100

# Log rotation configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check service status
docker-compose ps

# Check for port conflicts
netstat -tlnp | grep :3000
netstat -tlnp | grep :5000

# View detailed logs
docker-compose logs [service-name]
```

#### Database Connection Issues
```bash
# Test database connection
docker-compose exec backend node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => console.log('Connected')).catch(console.error);
"
```

#### MinIO Connection Issues
```bash
# Test MinIO connection
docker-compose exec backend node -e "
const { Client } = require('minio');
const client = new Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin'
});
client.bucketExists('pdfs').then(console.log).catch(console.error);
"
```

#### File Upload Issues
- Check file size limits (50MB default)
- Verify file type (PDF only)
- Check network timeout settings
- Verify MinIO bucket permissions

### Performance Tuning
- Increase PostgreSQL shared_buffers
- Configure MinIO cache settings
- Optimize Docker resource allocation
- Enable gzip compression in nginx

## Migration Guide

### Upgrading from Previous Versions
1. Backup existing data
2. Update docker-compose.yml
3. Run migrations if applicable
4. Test functionality
5. Monitor for issues

### Data Migration
```bash
# Export data from old system
docker-compose exec postgres pg_dump -U postgres boilerexam > migration.sql

# Import to new system
docker-compose exec -T postgres psql -U postgres boilerexam < migration.sql
```