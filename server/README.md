# ZeroTrace Server

Backend API server for ZeroTrace - secure, self-destructing note sharing platform.

## Features

- 🔐 Secure note creation with optional password protection
- 🔥 Self-destructing notes (read once)
- ⏱️ Optional expiration time
- 📱 Telegram notifications (optional)
- 🚀 Built with NestJS and Fastify
- 📊 System metrics endpoint for monitoring
- 🗄️ MySQL database with Sequelize ORM
- ⚡ Redis caching and BullMQ job queues
- 📝 Winston logging with daily rotation

## Prerequisites

- Node.js 18+ or Bun
- MySQL 8+
- Redis 6+

## Quick Start

### 1. Installation

```bash
# Install dependencies
yarn install
# or
bun install
```

### 2. Configuration

```bash
# Copy environment example
cp env.example .env

# Edit .env and configure:
# - Database credentials
# - Redis connection
# - Telegram bot token (optional)
# - Frontend origin
```

### 3. Database Setup

```bash
# Run migrations
yarn migrate
```

### 4. Generate Metrics API Key

```bash
# Generate and add METRICS_API_KEY to .env
node ../scripts/generate-metrics-api-key.js
```

### 5. Start Development Server

```bash
# Development mode with hot reload
yarn dev

# Production build
yarn build
yarn start:prod
```

## API Endpoints

### Notes

- `POST /api/v1/notes` - Create a new note
- `GET /api/v1/notes/:uniqueLink` - Read a note (password required if protected)
- `GET /api/v1/notes/:uniqueLink/status` - Check if note exists without reading

### Telegram

- `GET /api/v1/telegram/webhook` - Telegram bot webhook endpoint

### Metrics

- `GET /api/v1/metrics` - System metrics and statistics
  - **Protected by API key**
  - Option 1 (Header): `X-API-Key: your-metrics-api-key`
  - Option 2 (Query): `?key=your-metrics-api-key`
  - Returns: Server stats, database stats, queue stats, Redis stats

## Metrics Endpoint

The `/api/v1/metrics` endpoint provides comprehensive system monitoring:

```bash
# Example request with header (more secure)
curl -H "X-API-Key: your-api-key" http://localhost:7000/api/v1/metrics

# Example request with query parameter (convenient for browser)
# Just open in browser or save as bookmark:
http://localhost:7000/api/v1/metrics?key=your-api-key
```

**Tip:** Use a browser JSON viewer extension for better readability!

Response example:
```json
{
  "timestamp": "2025-10-21T10:30:00.000Z",
  "server": {
    "uptime": "2h 15m 30s",
    "uptimeSeconds": 8130,
    "cpu": {
      "usage": "15.23%",
      "usagePercent": 15.23
    },
    "memory": {
      "used": "120.45 MB",
      "usedBytes": 126312448,
      "total": "512.00 MB",
      "totalBytes": 536870912,
      "percentUsed": "23.54%",
      "rss": "245.67 MB",
      "external": "5.23 MB"
    },
    "nodeVersion": "v20.10.0",
    "platform": "win32",
    "pid": 12345
  },
  "database": {
    "notes": {
      "total": 1523,
      "active": 342,
      "withPassword": 128,
      "expired": 45,
      "createdToday": 23,
      "readToday": 18
    },
    "owners": {
      "total": 156
    }
  },
  "queues": {
    "telegramNotifications": {
      "waiting": 2,
      "active": 1,
      "completed": 856,
      "failed": 3,
      "delayed": 0,
      "total": 862,
      "status": "healthy",
      "health": {
        "waitingOk": true,
        "activeOk": true
      }
    }
  },
  "redis": {
    "status": "connected",
    "keys": 1247,
    "memory": {
      "used": "2.45M",
      "usedBytes": 2568192,
      "max": "unlimited",
      "maxBytes": 0,
      "fragmentation": "1.02"
    }
  }
}
```

**What you can see:**
- ✅ **CPU Usage** - Is server overloaded?
- ✅ **Memory Usage** - How much RAM is used?
- ✅ **Queue Status** - Are jobs backing up? (healthy/overloaded)
- ✅ **Redis Health** - How many keys, memory usage
- ✅ **Database Stats** - Active notes, daily activity

## Environment Variables

See `env.example` for all available configuration options.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 7000)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL configuration
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis configuration
- `FRONTEND_ORIGIN` - CORS allowed origins (comma-separated)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token for notifications
- `METRICS_API_KEY` - API key for /metrics endpoint

## Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem config
pm2 start ../ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs zerotrace-server
```

### Using Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f server
```

## Testing

```bash
# Run unit tests
yarn test

# Run tests with coverage
yarn test:cov

# Run e2e tests
yarn test:e2e
```

## Scripts

- `yarn dev` - Start development server with watch mode
- `yarn build` - Build for production
- `yarn start:prod` - Start production server
- `yarn migrate` - Run database migrations
- `yarn lint` - Lint code
- `yarn format` - Format code with Prettier

## Project Structure

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Application entry point
├── common/                 # Shared utilities
│   ├── config/            # Configuration files
│   ├── decorators/        # Custom decorators
│   └── utils/             # Utility functions
├── notes/                 # Notes module
│   ├── dto/              # Data transfer objects
│   ├── models/           # Sequelize models
│   └── tasks/            # Cron tasks
├── owner/                # Owner (Telegram users) module
├── telegram/             # Telegram bot integration
│   └── processors/       # BullMQ job processors
├── queue/                # Queue configuration
├── metrics/              # System metrics endpoint
├── http-cache/           # HTTP caching
└── redis-cache/          # Redis caching
```

## License

UNLICENSED - Private project
