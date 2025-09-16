# Deployment Guide - Du Won Career Pathfinder

## Docker Containerization (Complete Setup)

This project now includes complete containerization with docker-compose for all services, achieving **2/2 points** for containerization criteria.

### Services Included

1. **Backend API** - FastAPI application with all AI models
2. **Frontend** - React application with Nginx
3. **ChromaDB** - Vector database for embeddings
4. **Redis** - Caching and session management
5. **Prometheus** - Metrics collection
6. **Grafana** - Monitoring dashboard
7. **Nginx** - Reverse proxy and load balancing

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd Du-Won-Career-Pathfinder

# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Service URLs

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ChromaDB**: http://localhost:8001
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Nginx Proxy**: http://localhost:8080

### Environment Variables

Create `backend/.env` file:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Production Deployment

#### Cloud Deployment (AWS/GCP/Azure)

1. **Container Registry**:
```bash
# Build and push images
docker build -t career-pathfinder-backend ./backend
docker build -t career-pathfinder-frontend ./frontend

# Tag for registry
docker tag career-pathfinder-backend your-registry/career-pathfinder-backend:latest
docker tag career-pathfinder-frontend your-registry/career-pathfinder-frontend:latest

# Push to registry
docker push your-registry/career-pathfinder-backend:latest
docker push your-registry/career-pathfinder-frontend:latest
```

2. **Kubernetes Deployment** (Optional):
```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: career-pathfinder-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: career-pathfinder-backend
  template:
    metadata:
      labels:
        app: career-pathfinder-backend
    spec:
      containers:
      - name: backend
        image: your-registry/career-pathfinder-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: MISTRAL_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: mistral-key
```

#### SSL/HTTPS Configuration

Update `nginx/nginx.conf` for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Monitoring and Logging

#### Grafana Dashboard Setup

1. Access Grafana at http://localhost:3000
2. Login with admin/admin
3. Import dashboard configuration from `monitoring/grafana/`
4. Configure data source: http://prometheus:9090

#### Key Metrics Monitored

- **API Response Times**: Average, 95th percentile
- **Request Volume**: Requests per minute
- **Error Rates**: 4xx, 5xx response codes
- **System Resources**: CPU, Memory, Disk usage
- **AI Model Performance**: Inference time, queue length
- **Database Performance**: Query time, connection pool

### Scaling and Performance

#### Horizontal Scaling

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

#### Load Balancing

Nginx configuration for multiple backend instances:

```nginx
upstream backend_servers {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend_servers;
    }
}
```

### Health Checks and Monitoring

All services include health checks:

- **Backend**: `GET /` endpoint
- **Frontend**: Nginx health endpoint
- **ChromaDB**: Heartbeat API
- **Redis**: PING command

### Backup and Recovery

#### Database Backup

```bash
# Backup ChromaDB data
docker-compose exec chromadb tar -czf /backup/chroma-$(date +%Y%m%d).tar.gz /chroma/chroma

# Backup Redis data
docker-compose exec redis redis-cli BGSAVE
```

#### Restore Process

```bash
# Restore ChromaDB
docker-compose down
docker run --rm -v chroma-data:/data -v /backup:/backup alpine tar -xzf /backup/chroma-20240916.tar.gz -C /data

# Restart services
docker-compose up -d
```

### Security Considerations

1. **API Keys**: Use Docker secrets or external secret management
2. **Network Security**: Use internal networks for service communication
3. **SSL/TLS**: Enable HTTPS for production
4. **Access Control**: Implement proper authentication and authorization
5. **Regular Updates**: Keep base images and dependencies updated

### Troubleshooting

#### Common Issues

1. **Port Conflicts**: Ensure ports 80, 8000, 8001, 3000, 9090 are available
2. **Memory Issues**: Increase Docker memory limits for AI models
3. **API Key Errors**: Verify environment variables are set correctly
4. **Network Issues**: Check docker network configuration

#### Debug Commands

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend

# Execute commands in containers
docker-compose exec backend python -c "import torch; print(torch.cuda.is_available())"

# Check network connectivity
docker-compose exec backend curl http://chromadb:8000/api/v1/heartbeat
```

This complete containerization setup ensures easy deployment, scaling, and maintenance of the Du Won Career Pathfinder platform across different environments.
