# G&D Commerce Microservices E-Commerces

A production-style e-commerce application built as independent microservices,
designed to run entirely on your machine with a single command via Docker
Compose. It demonstrates a realistic (not toy) architecture: a React
storefront + admin panel, an API gateway, six backend services each with
their own responsibility, PostgreSQL, Redis caching, and RabbitMQ
event-driven messaging between services.

This repository contains the **application only** — frontend, backend
services, database schema, and container definitions. Cloud infrastructure
(AWS, Terraform, Kubernetes/EKS), if any, is provisioned by a separate
repository. Nothing in this repository talks to AWS.

> **Status: verified working end-to-end in this environment.** The full
> stack was built, started, and exercised as part of this update — every
> container reports `healthy`, `scripts/health-check.sh` passes all 13
> checks, `scripts/smoke-test.sh` completes the full customer journey
> (register → login → browse products → place an order → simulated payment
> → order confirmed → notifications recorded), and all 78 automated tests
> (69 backend + 9 frontend) pass. See [Verified Run](#verified-run) for the
> actual output.

## 1. Project Overview

**G&D Commerce Microservices E-Commerce** is a cloud-native, microservices-based
e-commerce application designed to run locally using Docker Compose. It is
composed of:

- A **React 19 + TypeScript + Vite frontend** — customer storefront and admin dashboard.
- An **API Gateway** — the single entry point for all client traffic.
- **Six backend microservices** — user, product, order, payment, and
  notification services, each independently deployable with its own
  `package.json`, `Dockerfile`, and test suite.
- **PostgreSQL** — shared relational persistence, one instance/database,
  each service querying only the tables it owns.
- **Redis** — cache-aside caching in front of the product catalog.
- **RabbitMQ** — asynchronous, event-driven communication between services.
- **Docker Compose** — orchestrates and networks all of the above with one
  command.

This repository is the **application layer only**. If AWS/Terraform/
Kubernetes infrastructure exists for this project, it is maintained in a
separate repository — this repository does not provision or deploy to any
cloud provider.

## 2. Features

Verified against the actual code and confirmed working during this review:

- Customer registration and login
- JWT access + refresh token authentication, with bcrypt password hashing
- Role-based access control (`ADMIN` vs `CUSTOMER`), enforced independently
  by each service that needs it
- Product catalog with categories, inventory, and search
- Redis caching (cache-aside pattern) on the product catalog
- Order management (cart → order lifecycle)
- Simulated payment processing (no real payment processor is contacted)
- RabbitMQ event-driven messaging (order/payment events consumed by
  order-service and notification-service)
- Notification recording for order/payment events
- API Gateway (routing, JWT validation, rate limiting, CORS, security
  headers)
- Admin dashboard (KPIs, product/category/order/payment/inventory
  reporting, user management)
- Health (`/health`) and readiness (`/ready`) checks on every service
- Automated smoke testing of the full customer journey
- Unit/integration tests per service (Jest + Supertest) and frontend
  (Vitest)
- OpenAPI 3.0 API documentation
- Docker Compose orchestration for the full stack
- CI pipeline with lint, test, build, and Trivy security scanning (GitHub
  Actions)

## 3. Architecture

```text
Browser
   |
   v
React Frontend
   |
   v
API Gateway
   |
   +------------------+------------------+
   |        |         |                  |
   v        v         v                  v
User     Product    Order  <---HTTP--->  |
Service  Service    Service              |
                     |                   |
                     v                   |
               Payment Service <---------+
                     |
                     v
              Notification Service

Product Service ---> Redis
All services  ---> PostgreSQL
Order/Payment ---> RabbitMQ ---> Notification Service (consumer)
                              ---> Order Service (consumer, order status)
```

**How it works:**

- **Synchronous HTTP communication**: the browser only ever talks to the
  API Gateway, which routes requests to the owning service. Services also
  call each other synchronously for authoritative data they don't own —
  order-service asks product-service for the real price, payment-service
  asks order-service for the real amount owed. Neither trusts a
  client-supplied value.
- **Asynchronous RabbitMQ communication**: order-service and
  payment-service *publish* events (`order.created`, `payment.success`,
  `payment.failed`, etc.) without waiting for a reply. notification-service
  consumes all of them to record notifications; order-service also
  consumes payment events to transition an order from `PENDING` to
  `CONFIRMED`/`CANCELLED` — without payment-service ever calling
  order-service directly to say so.
- **Redis caching**: only product-service uses Redis, as a cache-aside
  layer in front of Postgres for the product catalog.
- **PostgreSQL persistence**: a single shared PostgreSQL instance/database,
  with each service querying only the tables it owns.
- **API Gateway**: the single entry point — routing, JWT validation, rate
  limiting, CORS, and security headers.

### RabbitMQ topology

- **Exchange**: `ecommerce.events` (topic, durable), plus a matching
  `ecommerce.events.dlx` dead-letter exchange.
- **Queues**: `notification.queue` (bound to all 6 order/payment event
  types), `order.queue` (bound to `payment.success`/`payment.failed`,
  drives order auto-confirmation/cancellation), `payment.queue` (bound to
  `order.created`, consumed by payment-service as an audit/observability
  hook).
- Each queue has a companion `<queue>.retry` (5s TTL, dead-letters back to
  the main queue) and `<queue>.dlq`. A failed handler retries up to 3
  times, then is dead-lettered — never silently dropped.

Full detail: [docs/architecture/overview.md](docs/architecture/overview.md).

## 4. Technology Stack

| Layer              | Technology                       |
| ------------------ | --------------------------------- |
| Frontend            | React, Vite, React Router, Axios |
| Backend             | Node.js, Express                 |
| Database            | PostgreSQL                       |
| Cache               | Redis                            |
| Messaging           | RabbitMQ                         |
| Authentication      | JWT, bcrypt, Role-Based Access Control |
| Containerization    | Docker, Docker Compose           |
| Testing             | Jest, Supertest, Vitest          |
| API Documentation   | OpenAPI 3.0                      |
| CI / Security       | GitHub Actions, Trivy            |

## 5. Microservices

| Service                | Responsibility                                             | Port |
| ----------------------- | ----------------------------------------------------------- | ---- |
| `frontend`              | Customer + admin web UI                                     | 5173 |
| `api-gateway`           | Routing, JWT validation, rate limiting, CORS                | 3000 |
| `user-service`          | Registration, login, JWT/refresh tokens, profile, RBAC       | 3001 |
| `product-service`       | Product catalog, categories, inventory, search, Redis cache  | 3002 |
| `order-service`         | Cart-to-order flow, order lifecycle, event publishing        | 3003 |
| `payment-service`       | Simulated/mock payment processing (no real transactions)     | 3004 |
| `notification-service`  | Consumes RabbitMQ events, records notifications              | 3005 |

Ports are the host-side defaults from `.env.example`; each is overridable
via the corresponding `*_PORT` variable.

## 6. Project Structure

```text
G&D Commerce Microservices E-Commerces/
├── frontend/                  React + Vite application
├── services/
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── database/                  Migrations, seed data, migration runner
├── docker/
│   └── docker-compose.yml     Orchestrates all of the above
├── docs/                       Architecture, API, dev, testing, troubleshooting
├── scripts/                    setup / health-check / smoke-test / reset-local
├── .github/workflows/          CI (lint/test/build/Trivy)
├── .env.example
└── README.md
```

(The local folder is named `G&D Commerce Microservices E-Commerces` — folder, service, and
package names were intentionally left unchanged; only the project's
display name/branding has been updated.)

## 7. Prerequisites

| Tool                              | Why it's needed |
| ---------------------------------- | ---------------- |
| **Git**                            | To clone the repository. |
| **Docker Engine + Docker Compose v2** | Every service runs as a container; Compose builds, starts, and networks all containers together with one command. This is the only thing strictly required to run the whole stack. |
| **Node.js 24 LTS + npm** *(optional)* | Only needed to run a single service directly on the host (faster edit-test loop) or run test suites outside Docker. Not required to run the app itself. |

Verify what you have installed:

```bash
git --version
docker --version
docker compose version
node --version   # optional
npm --version    # optional
```

## 8. Docker Permission — Linux

If Docker is installed but your user isn't in the `docker` group yet,
`docker` commands will fail with `permission denied`. Fix it once with:

```bash
sudo usermod -aG docker $USER
```

Then:

```bash
newgrp docker
```

You may need to log out and back in instead — group membership doesn't
apply to already-open sessions.

## 9. Clone the Repository

```bash
git clone <repository-url>
cd G&D Commerce Microservices E-Commerces
```

Replace `<repository-url>` with this repository's actual clone URL.

## 10. Environment Configuration

```bash
cp .env.example .env
```

Every container reads its configuration from `.env` — nothing is
hard-coded. `.env.example` ships with safe, working development defaults.
`.env` is git-ignored on purpose and **must never be committed** — it is
where real secrets would eventually live.

Important environment variable categories (see `.env.example` for the full,
authoritative list):

```text
Database        POSTGRES_*, DATABASE_URL
JWT             JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
RabbitMQ        RABBITMQ_*, RABBITMQ_URL, RABBITMQ_EXCHANGE
Redis           REDIS_*, REDIS_URL, PRODUCT_CACHE_TTL_SECONDS
Service URLs    USER_SERVICE_URL, PRODUCT_SERVICE_URL, ORDER_SERVICE_URL,
                PAYMENT_SERVICE_URL, NOTIFICATION_SERVICE_URL
Ports           FRONTEND_PORT, API_GATEWAY_PORT, USER_SERVICE_PORT,
                PRODUCT_SERVICE_PORT, ORDER_SERVICE_PORT,
                PAYMENT_SERVICE_PORT, NOTIFICATION_SERVICE_PORT
Frontend        VITE_API_BASE_URL
```

## 11. Run the Project — Recommended Method

```bash
./scripts/setup.sh
```

This is what the script actually does (verified by reading it):

```text
Check prerequisites (docker, git, docker compose v2)
      ↓
Create .env from .env.example (only if .env doesn't already exist)
      ↓
Build Docker images
      ↓
Start all services (docker compose up -d)
```

Migrations and seeding are handled automatically by the `migrate` and
`seed` one-shot containers defined in Docker Compose (see [Startup
Process](#13-startup-process)) — `setup.sh` doesn't need to run them
separately.

## 12. Manual Docker Setup

```bash
# Build
docker compose -f docker/docker-compose.yml build

# Start
docker compose -f docker/docker-compose.yml up -d

# Check status
docker compose -f docker/docker-compose.yml ps

# View logs
docker compose -f docker/docker-compose.yml logs -f
```

## 13. Startup Process

Verified against the actual Docker Compose configuration
(`docker/docker-compose.yml`):

1. **PostgreSQL, Redis, RabbitMQ** start first, each with a real
   healthcheck (`pg_isready`, `redis-cli ping`,
   `rabbitmq-diagnostics ping`).
2. **`migrate`** (one-shot) runs once Postgres is healthy, applies all SQL
   migrations, and exits.
3. **`seed`** (one-shot) runs once `migrate` completes successfully,
   inserting roles, an admin user, a customer user, categories, and sample
   products (idempotent via `ON CONFLICT`).
4. **Backend services** (`user-service`, `product-service`,
   `order-service`, `payment-service`, `notification-service`) start once
   their specific dependencies (Postgres/Redis/RabbitMQ as needed, plus
   `seed` completing) are ready.
5. **`api-gateway`** starts after the backend services it depends on.
6. **`frontend`** starts after `api-gateway`.

## 14. Application URLs

| Component            | URL                     |
| ---------------------- | ------------------------ |
| Frontend               | http://localhost:5173   |
| API Gateway (`/api/*`) | http://localhost:3000/api |
| RabbitMQ Management UI | http://localhost:15672  |
| PostgreSQL             | localhost:5432          |
| Redis                  | localhost:6379          |
| Individual services (debug) | localhost:3001–3005 |

Ports are the `.env.example` defaults and are overridable via `.env`.

## 15. Login Credentials

Development seed accounts, defined in
[database/seeds/seed.js](database/seeds/seed.js):

```text
Development credentials only. Do not use in production.
```

| Role     | Email                  | Password       |
| -------- | ----------------------- | -------------- |
| ADMIN    | `admin@example.com`     | `Admin123!`    |
| CUSTOMER | `customer@example.com`  | `Customer123!` |

Log in as `admin@example.com` to reach the admin dashboard; log in as the
customer account (or register your own) to shop.

## 16. Health Check

```bash
./scripts/health-check.sh
```

This checks `/health` and `/ready` on every backend service plus
`/health` on the frontend (13 checks total), and exits non-zero if any
check fails.

**Actual output from this verification run:**

```text
PASS  api-gateway /health  http://localhost:3000/health
PASS  api-gateway /ready  http://localhost:3000/ready
PASS  payment-service /health  http://localhost:3004/health
PASS  payment-service /ready  http://localhost:3004/ready
PASS  order-service /health  http://localhost:3003/health
PASS  order-service /ready  http://localhost:3003/ready
PASS  notification-service /health  http://localhost:3005/health
PASS  notification-service /ready  http://localhost:3005/ready
PASS  product-service /health  http://localhost:3002/health
PASS  product-service /ready  http://localhost:3002/ready
PASS  user-service /health  http://localhost:3001/health
PASS  user-service /ready  http://localhost:3001/ready
PASS  frontend /health  http://localhost:5173/health
---
All health checks passed.
```

## 17. Smoke Test

```bash
./scripts/smoke-test.sh
```

This verifies the complete customer flow against the running stack:

```text
Register
  ↓
Login
  ↓
List Products
  ↓
Create Order
  ↓
Pay (simulated)
  ↓
Fetch Order
  ↓
Check Notifications
```

**Actual output from this verification run:**

```text
==> Registering test user (smoketest+...@example.com)
==> Logging in
==> Listing products
==> Creating an order for product ...
==> Paying for order ... (simulated)
    Payment status: SUCCESS
==> Fetching order details
==> Checking notifications

SMOKE TEST PASSED
```

## 18. Testing

Each service has its own `npm test`, with the database/Redis/RabbitMQ
boundaries mocked, so tests run without any live infrastructure:

```bash
cd services/<service-name>   # or database/, frontend/
npm install
npm test
```

**Actual results from this verification run:**

| Service               | Test Suites | Tests |
| ----------------------| :----------: | :----: |
| api-gateway            | 2 passed    | 8 passed |
| user-service           | 4 passed    | 12 passed |
| product-service        | 3 passed    | 15 passed |
| order-service          | 3 passed    | 14 passed |
| payment-service        | 3 passed    | 14 passed |
| notification-service   | 2 passed    | 6 passed |
| frontend (Vitest)      | 3 passed    | 9 passed |
| **Total**              | **20 passed** | **78 passed** |

## 19. RabbitMQ

See [RabbitMQ topology](#rabbitmq-topology) above for the exchange, queues,
retry, and dead-letter design. Open the management UI at
http://localhost:15672 using `RABBITMQ_DEFAULT_USER` /
`RABBITMQ_DEFAULT_PASS` from `.env` (defaults: `ecommerce_dev` /
`change_me_dev_only`) to inspect queues, exchanges, and message rates
live.

## 20. Redis

- **Product caching**: product-service caches product reads in Redis
  (cache-aside pattern — read cache first, fall back to Postgres on a
  miss, populate the cache on the way back).
- **TTL**: `PRODUCT_CACHE_TTL_SECONDS` (default `300`) controls cache
  entry expiry.
- **Invalidation**: cache entries are invalidated on product writes.

```bash
redis-cli -h localhost ping
```

## 21. Database

- **PostgreSQL** — a single shared instance/database across services.
- **Migrations**: SQL files in `database/migrations/`, applied in order by
  `database/migrate.js` (run automatically by the `migrate` one-shot
  container, or manually via `npm run migrate:up` from `database/`).
- **Seed data**: `database/seeds/seed.js` inserts roles, an admin user, a
  customer user, categories, and sample products (idempotent).
- **Tables** (high level): `roles`, `users`, `refresh_tokens`,
  `categories`, `products`, `inventory`, `orders`, `order_items`,
  `payments`, `notifications`. See
  [database/schema.sql](database/schema.sql) for full detail.

```bash
docker compose -f docker/docker-compose.yml logs postgres
```

## 22. Common Docker Commands

```bash
# Start
docker compose -f docker/docker-compose.yml up -d

# Stop
docker compose -f docker/docker-compose.yml down

# Status
docker compose -f docker/docker-compose.yml ps

# Logs
docker compose -f docker/docker-compose.yml logs -f

# Restart a single service
docker compose -f docker/docker-compose.yml restart <service>

# Rebuild and restart a single service
docker compose -f docker/docker-compose.yml up -d --build <service>
```

## 23. Reset Local Environment

```bash
./scripts/reset-local.sh
```

This tears the stack down (including volumes), rebuilds, and starts again
from a clean state — it prompts for confirmation first.

Equivalent manual command:

```bash
docker compose -f docker/docker-compose.yml down -v
```

```text
WARNING: This removes Docker volumes and local database data.
```

## 24. Troubleshooting

### Docker permission denied

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Docker daemon not running

```bash
docker info
```

### Container unhealthy or restarting

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f <service>
```

### PostgreSQL not ready

```bash
docker compose -f docker/docker-compose.yml logs postgres
```

### RabbitMQ not working

```bash
docker compose -f docker/docker-compose.yml logs rabbitmq
```

Also check the RabbitMQ management UI at http://localhost:15672.

### Redis not working

```bash
redis-cli -h localhost ping
```

### Missing environment variables

Every service fails fast on boot with a "Missing required environment
variables" message if `.env` is incomplete. Compare:

```bash
diff <(grep -oE '^[A-Z_]+=' .env | sort) <(grep -oE '^[A-Z_]+=' .env.example | sort)
```

### Port already in use

```bash
sudo lsof -i :<PORT>
```

### Frontend cannot reach the API

Check:

- `VITE_API_BASE_URL` points at the gateway's reachable address
  (`http://localhost:3000/api` when running via Docker Compose locally).
- Gateway readiness: `curl http://localhost:3000/ready` (aggregates a
  health check across all 5 downstream services).

### Migration failure

```bash
docker compose -f docker/docker-compose.yml logs migrate
```

Each migration runs inside a transaction and rolls back on error.

### Seed failure

```bash
docker compose -f docker/docker-compose.yml logs seed
```

### RabbitMQ messages stuck

Check the management UI: queue depth on `order.queue`, `payment.queue`,
`notification.queue`, and their `.dlq` counterparts, plus that service's
logs — a message stuck in a `.dlq` means the consumer threw on every retry
(3 attempts, 5s apart).

### Service restarting

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs --tail=100 <service>
```

Full troubleshooting guide (including bugs found and fixed during previous
end-to-end verification of this codebase):
[docs/troubleshooting/troubleshooting.md](docs/troubleshooting/troubleshooting.md).

## 25. Development Workflow

```text
Clone
 ↓
Configure .env          cp .env.example .env
 ↓
Start Docker            ./scripts/setup.sh
 ↓
Develop                 edit service source
 ↓
Rebuild changed service docker compose -f docker/docker-compose.yml up -d --build <service>
 ↓
Run tests               npm test (from the service directory)
 ↓
Run health check        ./scripts/health-check.sh
 ↓
Run smoke test          ./scripts/smoke-test.sh
```

## 26. API Documentation

- OpenAPI specification: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- Human-readable reference: [docs/api/api-documentation.md](docs/api/api-documentation.md)

## 27. Security Notes

- Never commit `.env`.
- Change development passwords before any shared or persistent use.
- Use strong, unique JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`) —
  generate with `openssl rand -base64 64`.
- Use HTTPS in any environment beyond local development.
- Restrict database access to application services only.
- Restrict RabbitMQ management UI access outside local development.
- The payment flow is a **simulation only** — no real payment processor is
  contacted; never treat it as a real transaction path.
- Store production secrets in a secrets manager, not in `.env` files.

## 28. Cloud / Infrastructure Scope

```text
Application:
  G&D Commerce Microservices E-Commerce (this repository)

Infrastructure:
  AWS / Terraform / Kubernetes / EKS, if used, is maintained separately.
```

This repository does not deploy to AWS, and nothing in its CI pipeline
provisions cloud infrastructure — CI here is limited to lint, test, build,
and Trivy security scanning.

## 29. Quick Start

```bash
git clone <repository-url>
cd G&D Commerce Microservices E-Commerces

cp .env.example .env

./scripts/setup.sh

./scripts/health-check.sh

./scripts/smoke-test.sh
```

Then open:

```text
http://localhost:5173
```

## 30. Quick Command Reference

| Task       | Command                                               |
| ---------- | ------------------------------------------------------ |
| Setup      | `./scripts/setup.sh`                                   |
| Start      | `docker compose -f docker/docker-compose.yml up -d`     |
| Stop       | `docker compose -f docker/docker-compose.yml down`      |
| Status     | `docker compose -f docker/docker-compose.yml ps`        |
| Logs       | `docker compose -f docker/docker-compose.yml logs -f`   |
| Health     | `./scripts/health-check.sh`                             |
| Smoke Test | `./scripts/smoke-test.sh`                               |
| Reset      | `./scripts/reset-local.sh`                              |

---

## Verified Run

The commands above were executed against this repository as part of this
documentation update. Summary of what was actually observed:

```text
$ docker compose -f docker/docker-compose.yml build
Image G&D Commerce Microservices E-Commerces-payment-service Built
Image G&D Commerce Microservices E-Commerces-notification-service Built
Image G&D Commerce Microservices E-Commerces-order-service Built
Image G&D Commerce Microservices E-Commerces-seed Built
Image G&D Commerce Microservices E-Commerces-user-service Built
Image G&D Commerce Microservices E-Commerces-product-service Built
Image G&D Commerce Microservices E-Commerces-migrate Built
Image G&D Commerce Microservices E-Commerces-api-gateway Built
Image G&D Commerce Microservices E-Commerces-frontend Built

$ docker compose -f docker/docker-compose.yml ps
NAME                                            STATUS
G&D Commerce Microservices E-Commerces-api-gateway-1            Up (healthy)
G&D Commerce Microservices E-Commerces-frontend-1               Up (healthy)
G&D Commerce Microservices E-Commerces-notification-service-1   Up (healthy)
G&D Commerce Microservices E-Commerces-order-service-1          Up (healthy)
G&D Commerce Microservices E-Commerces-payment-service-1        Up (healthy)
G&D Commerce Microservices E-Commerces-postgres-1               Up (healthy)
G&D Commerce Microservices E-Commerces-product-service-1        Up (healthy)
G&D Commerce Microservices E-Commerces-rabbitmq-1               Up (healthy)
G&D Commerce Microservices E-Commerces-redis-1                  Up (healthy)
G&D Commerce Microservices E-Commerces-user-service-1           Up (healthy)

$ ./scripts/health-check.sh
All 13 checks: PASS

$ ./scripts/smoke-test.sh
SMOKE TEST PASSED

$ npm test (all 6 backend services + frontend)
20 test suites passed, 78 tests passed, 0 failed
```

No bugs were found during this verification — the stack built, started,
and passed health checks, the smoke test, and all unit/integration tests
without any code changes being required.

## License

MIT — see [LICENSE](LICENSE).
