# Local Development Guide

## Prerequisites

- Git
- Node.js 20 LTS + npm (only needed if running a service outside Docker)
- Docker + Docker Compose v2

## First-time setup

```bash
git clone <repository-url>
cd cloud-native-ecommerce
./scripts/setup.sh
```

`setup.sh` checks prerequisites, copies `.env.example` to `.env` if one
doesn't exist yet, builds every image, and starts the stack. Equivalent
manual steps:

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
```

## Verifying the stack is healthy

```bash
./scripts/health-check.sh
./scripts/smoke-test.sh
```

`health-check.sh` hits `/health` and `/ready` on every service.
`smoke-test.sh` exercises the full golden path end-to-end (register →
login → browse → order → simulated payment → notifications) through the
API Gateway.

## Default local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000/api |
| RabbitMQ management UI | http://localhost:15672 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Seeded accounts (development only, see
[database/seeds/seed.js](../../database/seeds/seed.js)):

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@example.com | Admin123! |
| CUSTOMER | customer@example.com | Customer123! |

## Common operations

```bash
# View logs for one service
docker compose -f docker/docker-compose.yml logs -f order-service

# View logs for everything
docker compose -f docker/docker-compose.yml logs -f

# Stop the stack (keeps data volumes)
docker compose -f docker/docker-compose.yml down

# Restart a single service after a code change
docker compose -f docker/docker-compose.yml up -d --build user-service

# Reset everything, including database/queue data
./scripts/reset-local.sh
```

## Running a service outside Docker (faster iteration)

Each backend service can run directly with Node if you point it at the
Dockerized infra:

```bash
cd services/user-service
npm install
# Ensure Postgres/Redis/RabbitMQ from docker compose are running, then
# override the relevant *_URL vars to localhost instead of the service name:
DATABASE_URL=postgresql://ecommerce_dev:change_me_dev_only@localhost:5432/ecommerce_db \
JWT_SECRET=dev_only_jwt_secret_change_me \
JWT_REFRESH_SECRET=dev_only_jwt_refresh_secret_change_me \
npm run dev
```

## Database migrations & seeding

Migrations and seed data run automatically as one-shot Compose services
(`migrate`, then `seed`) before any app service starts. To run them
manually:

```bash
cd database
npm install
DATABASE_URL=postgresql://ecommerce_dev:change_me_dev_only@localhost:5432/ecommerce_db npm run migrate:up
DATABASE_URL=postgresql://ecommerce_dev:change_me_dev_only@localhost:5432/ecommerce_db npm run migrate:status
DATABASE_URL=postgresql://ecommerce_dev:change_me_dev_only@localhost:5432/ecommerce_db npm run migrate:down   # rolls back the latest migration
DATABASE_URL=postgresql://ecommerce_dev:change_me_dev_only@localhost:5432/ecommerce_db npm run seed
```

## Frontend development

```bash
cd frontend
npm install
npm run dev       # Vite dev server on :5173 with hot reload
npm run build     # production build
npm test          # Vitest
```

Set `VITE_API_BASE_URL` in `frontend/.env.local` (or the shell) if the
gateway isn't at the default `http://localhost:3000/api`.
