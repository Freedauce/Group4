# KigaliDrive - Docker Deployment Guide

## Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop/))
- Git (optional, for cloning)

## Quick Start

### 1. Clone or navigate to project
```bash
cd FinalExam3
```

### 2. Set up environment variables
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual values:
# - JWT_SECRET_KEY: Your secret key (min 32 chars)
# - EMAIL_PASSWORD: Gmail App Password
# - GOOGLE_CLIENT_ID: Google OAuth Client ID
```

### 3. Build and run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d
```

### 4. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5139/api
- **API Health Check**: http://localhost:5139/api/health

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild after code changes
```bash
docker-compose up --build -d
```

### Clean up everything (including volumes)
```bash
docker-compose down -v
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Docker Host                    │
│                                                  │
│  ┌──────────────┐       ┌──────────────────┐    │
│  │   Frontend   │       │     Backend      │    │
│  │  (Nginx:80)  │──────►│  (.NET:5139)     │    │
│  │              │  API  │                  │    │
│  │  Port: 3000  │       │  Port: 5139      │    │
│  └──────────────┘       └────────┬─────────┘    │
│                                  │              │
│                         ┌────────▼─────────┐    │
│                         │  SQLite Volume   │    │
│                         │  (Persistent)    │    │
│                         └──────────────────┘    │
└─────────────────────────────────────────────────┘
```

## Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| backend | kigalidrive-api | 5139 | .NET 8 Web API |
| frontend | kigalidrive-web | 3000 | React + Nginx |

## Volumes

| Volume | Purpose |
|--------|---------|
| kigalidrive-data | SQLite database persistence |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| JWT_SECRET_KEY | Yes | JWT signing key (min 32 chars) |
| EMAIL_PASSWORD | Yes | Gmail App Password for SMTP |
| GOOGLE_CLIENT_ID | No | Google OAuth Client ID |
| EMAIL_SENDER | No | Sender email address |

## Troubleshooting

### Container not starting
```bash
# Check logs
docker-compose logs backend

# Check if port is in use
netstat -an | findstr 5139
```

### Database issues
```bash
# Reset database (warning: data loss)
docker-compose down -v
docker-compose up --build -d
```

### Health check failing
```bash
# Test health endpoint directly
curl http://localhost:5139/api/health
```

## Production Deployment

For production, consider:
1. Use a proper reverse proxy (Nginx, Traefik)
2. Enable HTTPS with SSL certificates
3. Use environment-specific configurations
4. Set up proper logging and monitoring
5. Use Docker Swarm or Kubernetes for scaling
