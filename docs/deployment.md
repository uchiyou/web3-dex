# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

## Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
- `JWT_SECRET` - Generate a secure random string
- `PRIVATE_KEY` - Your deployment wallet private key
- RPC URLs and API keys

## Quick Start (Docker)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

## Local Development

### Database Setup

```bash
# Using Docker
docker run -d \
  --name web3-dex-postgres \
  -e POSTGRES_DB=web3_dex \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Initialize tables
psql -h localhost -U postgres -d web3_dex -f database/schemas/init.sql
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Smart Contract Deployment

### Compile

```bash
cd contracts
npm install
npx hardhat compile
```

### Deploy to Testnet

```bash
# Edit hardhat.config.ts with your network settings
npx hardhat run scripts/deploy.ts --network sepolia
```

### Verify Contracts

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Production Checklist

- [ ] Set secure `JWT_SECRET`
- [ ] Configure SSL certificates
- [ ] Enable HTTPS redirect in nginx
- [ ] Set proper `CORS_ORIGIN`
- [ ] Configure firewall rules
- [ ] Enable log monitoring
- [ ] Set up backups for PostgreSQL
- [ ] Configure Redis persistence
- [ ] Review rate limits
- [ ] Security audit completed

## Monitoring

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# All services
docker-compose logs -f
```

### Health Check

```bash
curl http://localhost:3001/health
```

## Troubleshooting

### Database Connection Issues

Check PostgreSQL is running:
```bash
docker-compose ps postgres
```

Test connection:
```bash
docker-compose exec backend sh -c "nc -zv postgres 5432"
```

### Redis Connection Issues

Check Redis:
```bash
docker-compose logs redis
```

Test:
```bash
docker-compose exec backend sh -c "redis-cli ping"
```

### WebSocket Connection Issues

Ensure nginx properly forwards WebSocket headers:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```
