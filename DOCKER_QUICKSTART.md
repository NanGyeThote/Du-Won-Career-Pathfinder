# Docker Quick Start Guide

## Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)

## Quick Setup (2 minutes)

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your API keys
# Required: MISTRAL_API_KEY (get from https://console.mistral.ai/)
# Optional: GEMINI_API_KEY (get from https://aistudio.google.com/)
```

### 2. Build and Run with Docker Compose

```bash
# Simple setup (Backend + Frontend only)
docker-compose -f docker-compose.simple.yml up --build

# OR Full setup (with monitoring, redis, etc.)
docker-compose up --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build

# Use simple configuration (recommended for development)
docker-compose -f docker-compose.simple.yml up --build
```

### Stop and Clean
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Remove all images and rebuild
docker-compose down --rmi all
docker-compose up --build
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Troubleshooting
```bash
# Check service status
docker-compose ps

# Restart a specific service
docker-compose restart backend

# Execute commands inside containers
docker-compose exec backend python --version
docker-compose exec frontend ls -la

# Check container resource usage
docker stats
```

## Configuration Files

- `docker-compose.simple.yml` - Minimal setup (Backend + Frontend)
- `docker-compose.yml` - Full setup with monitoring and additional services
- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration
- `backend/.env` - Environment variables (create from .env.example)

## Common Issues

### Port Conflicts
If ports 3000 or 8000 are already in use:
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Modify ports in docker-compose.yml if needed
```

### API Key Issues
Make sure your `backend/.env` file contains:
```env
MISTRAL_API_KEY=your_actual_api_key_here
GEMINI_API_KEY=your_actual_api_key_here
```

### Build Failures
```bash
# Clean build (removes cache)
docker-compose build --no-cache

# Check Docker Desktop has enough resources (4GB+ RAM recommended)
```

### Database/Model Issues
```bash
# Reset all data and rebuild
docker-compose down -v
docker-compose up --build
```

## Development Workflow

### Making Code Changes
1. Make changes to your code
2. Rebuild the affected service:
   ```bash
   docker-compose up --build backend  # For backend changes
   docker-compose up --build frontend # For frontend changes
   ```

### Adding New Dependencies
1. Update `requirements.txt` (backend) or `package.json` (frontend)
2. Rebuild the container:
   ```bash
   docker-compose build --no-cache backend
   ```

## Production Deployment

For production deployment, use the full `docker-compose.yml` which includes:
- Monitoring with Prometheus and Grafana
- Redis for caching
- Health checks
- Proper networking

```bash
# Production deployment
docker-compose up -d --build

# Access monitoring
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
```

This Docker setup provides a complete containerized environment for the Du Won Career Pathfinder platform!
