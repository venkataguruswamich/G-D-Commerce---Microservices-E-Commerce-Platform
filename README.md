# Cloud-Native Microservices E-Commerce Platform

A production-style e-commerce application built as independent microservices,
designed to run entirely on your machine with a single command via Docker
Compose. It demonstrates a realistic (not toy) architecture: a React
storefront + admin panel, an API gateway, five backend services each with
their own responsibility, PostgreSQL, Redis caching, and RabbitMQ
event-driven messaging between services.

This repository contains the **application only** — frontend, backend
services, database schema, and container definitions. Cloud infrastructure
(AWS, Terraform, Kubernetes/EKS) is provisioned by a separate repository:
**Automated Multi-Tier AWS Infrastructure**. Nothing here talks to AWS.

> **Status: verified working end-to-end.** The full stack has been built,
> started, and exercised in this environment — every container reports
> `healthy`, `scripts/health-check.sh` passes all 13 checks, and
> `scripts/smoke-test.sh` completes the full customer journey (register →
> login → browse products → place an order → simulated payment → order
> confirmed → notifications recorded). See the [Verified Run](#verified-run)
> section below for the actual output.

## What this project demonstrates

- **Microservices, not a monolith**: 7 independently deployable services,
  each with its own `package.json`, `Dockerfile`, and tests — communicating
  over HTTP (synchronous, e.g. order-service asking product-service for a
  price) and RabbitMQ (asynchronous, e.g. payment-service telling
  order-service and notification-service that a payment succeeded).
- **Real auth**: JWT access + refresh tokens, bcrypt password hashing,
  role-based access control (`CUSTOMER` vs `ADMIN`) enforced independently
  by every service that needs it — not just at the edge.
- **Real caching**: Redis cache-aside pattern on the product catalog, with
  TTL expiry and invalidation on writes.
- **Real messaging semantics**: a topic exchange, durable queues, retry
  with backoff, and dead-letter queues — a failing message is retried a
  few times and then quarantined, never silently dropped.
- **A demo payment flow that's honest about being a demo**: no real payment
  processor is ever contacted; the outcome is a deterministic simulation,
  clearly labeled as such everywhere it appears (code, API, UI).

## Architecture

### System diagram

![System architecture: browser → React frontend → API Gateway → five backend services, which call each other synchronously for authoritative data, publish events to RabbitMQ, and share one PostgreSQL database, with Redis caching in front of the product catalog](docs/architecture/assets/architecture-diagram.svg)

**How to read it:** everything inside the dashed box is one container started
by `docker compose`. A request only ever enters through the Gateway — no
service is reachable from the browser directly. From there:
- **Black arrows** are the request path a real user triggers (browser → frontend → gateway → a service).
- **Blue dashed arrows** are a service calling another service synchronously over HTTP for data it doesn't own itself — Order Service asks Product Service for the authoritative price, Payment Service asks Order Service for the authoritative amount owed. Neither ever trusts a price/amount the client sends.
- **Purple arrows** are asynchronous: Order and Payment *publish* events onto RabbitMQ (solid) without waiting for a reply; Notification and Order *consume* events off it later (dashed) — this is what lets a payment result update the order and notify the customer without the payment service knowing either of them exists.
- **Red dashed arrows** are Redis — only Product Service uses it, as a cache in front of Postgres, not a replacement for it.
- **Green** shows every service sharing one PostgreSQL instance, each querying only the tables it owns.

Source file (edit and re-render if the architecture changes): [docs/architecture/assets/architecture-diagram.svg](docs/architecture/assets/architecture-diagram.svg).

### Event-driven flow: checkout → payment → confirmation

![Animated sequence diagram of checkout to payment to confirmation: the customer posts an order, Order Service gets the price from Product Service and publishes order.created; the customer then posts a payment, Payment Service gets the amount from Order Service, simulates an outcome, and publishes payment.success or payment.failed — which Order Service consumes independently to confirm or cancel the order and publish that status too, all recorded by Notification Service](docs/architecture/assets/checkout-sequence-diagram.svg)

**This diagram is animated** — the 18 messages draw in on a loop, in the
exact chronological order they happen at runtime, so you can watch the
request travel step by step instead of reading a static wall of arrows. If
your viewer doesn't render SVG animation (e.g. some IDE previewers), open
the file directly in a browser or GitHub's file view to see it play.

The diagram is split into the two phases the code actually has: **Phase 1**
is a plain synchronous checkout (order created as `PENDING`). **Phase 2** is
where the event-driven design earns its keep — Payment Service never calls
Order Service to say "confirm this order"; it only publishes
`payment.success`/`payment.failed`, and Order Service independently consumes
that event off RabbitMQ to transition itself. That's what the [Verified
Run](#verified-run) below confirms actually happens, not just what the code
intends.

### RabbitMQ topology

- **Exchange**: `ecommerce.events` (topic, durable), plus a matching
  `ecommerce.events.dlx` dead-letter exchange.
- **Queues**: `notification.queue` (bound to all 6 order/payment event
  types), `order.queue` (bound to `payment.success`/`payment.failed`,
  drives order auto-confirmation/cancellation), `payment.queue` (bound to
  `order.created`, consumed by payment-service purely as an audit hook).
- Each queue has a companion `<queue>.retry` (5s TTL, dead-letters back to
  the main queue) and `<queue>.dlq`. A failed handler retries up to 3
  times, then is dead-lettered — never silently dropped.

### Why a shared PostgreSQL database

A single shared PostgreSQL instance/database keeps local setup and
migrations simple while each service still only queries the tables it
owns (`users`/`roles`/`refresh_tokens`, `products`/`categories`/
`inventory`, `orders`/`order_items`, `payments`, `notifications`). Instead
of one service reading another's tables directly, services call each
other's REST APIs for authoritative data (e.g. order-service asks
product-service for price, payment-service asks order-service for the
amount owed) — ownership stays clear even though storage is physically
shared. See [database/schema.sql](database/schema.sql).

Full detail: [docs/architecture/overview.md](docs/architecture/overview.md).

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Cache | Redis |
| Message Broker | RabbitMQ |
| Auth | JWT, bcrypt, Role-Based Access Control |
| Containerization | Docker, Docker Compose |
| Testing | Jest, Supertest, Vitest |
| API Docs | OpenAPI 3.0 |
| CI | GitHub Actions, Trivy |

## Microservices

| Service | Responsibility |
|---|---|
| `frontend` | Customer + admin web UI |
| `api-gateway` | Routing, auth validation, rate limiting, CORS |
| `user-service` | Registration, login, JWT/refresh tokens, profile, RBAC |
| `product-service` | Product catalog, categories, inventory, search, Redis caching |
| `order-service` | Cart-to-order flow, order lifecycle, event publishing |
| `payment-service` | Simulated/mock payment processing (no real transactions) |
| `notification-service` | Consumes RabbitMQ events, records notifications |

## Repository Structure

```
.
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
└── .github/workflows/         CI (lint/test/build/Trivy) — no AWS deploy
```

---

## Prerequisites — what you need, and why

| Tool | Why it's needed |
|---|---|
| **Git** | To clone the repository. |
| **Docker Engine + Docker Compose v2** | Every service runs as a container; Compose starts and networks all 12 containers (7 app services + Postgres + Redis + RabbitMQ + 2 one-shot init jobs) together with one command. This is the only thing you strictly need to run the whole stack. |
| **Node.js 20 LTS + npm** | *Optional.* Only needed if you want to run a single service directly on your machine (faster edit-test loop than rebuilding a container) or run the test suites outside Docker. Not required to run the app itself. |

If Docker is installed but your user isn't in the `docker` group yet, `docker`
commands will fail with `permission denied`. Fix it once with:

```bash
sudo usermod -aG docker $USER
```

Then **log out and back in** (or run `newgrp docker` in your current shell) —
group membership doesn't apply to already-open sessions.

## Step-by-step: running the whole stack

### 1. Clone and enter the repository

```bash
git clone <repository-url>
cd cloud-native-ecommerce
```

### 2. Create your local environment file

```bash
cp .env.example .env
```

**Why:** every container reads its configuration (database URL, JWT
secrets, ports, RabbitMQ credentials, etc.) from `.env` — nothing is
hard-coded. `.env.example` ships with safe, working development defaults,
so this copy is all you need to get started. `.env` itself is git-ignored
on purpose: it's the one file where real secrets would eventually live, and
it must never be committed.

### 3. Build the images

```bash
docker compose -f docker/docker-compose.yml build
```

**Why a separate build step:** each service has its own multi-stage
`Dockerfile` (install dependencies → copy source → run as a non-root user).
Building explicitly first (rather than letting `up` build implicitly) makes
it obvious if a Dockerfile itself is broken, before you're also debugging
container startup and networking.

### 4. Start everything

```bash
docker compose -f docker/docker-compose.yml up -d
```

**Why `-d`:** runs containers in the background so your terminal is free;
use `docker compose -f docker/docker-compose.yml logs -f` any time you want
to watch what's happening.

**What happens, in order, and why:**
1. **Postgres, Redis, RabbitMQ** start first and each has a real
   healthcheck (`pg_isready`, `redis-cli ping`, `rabbitmq-diagnostics ping`)
   — nothing downstream starts until these report *healthy*, not just
   *running*, because "the process started" and "the database will accept
   a connection" are different things.
2. **`migrate`** runs once, applies every SQL migration in order, and
   exits. It only starts after Postgres is healthy.
3. **`seed`** runs once after `migrate` succeeds, inserting an admin user,
   a customer user, categories, and sample products (safe to run more than
   once — it uses `ON CONFLICT` so it won't duplicate data or error on a
   restart).
4. **The 6 backend services** start once their specific dependencies
   (Postgres/Redis/RabbitMQ as needed, plus `seed` completing) are ready —
   this ordering is what stops you from ever seeing a "table does not
   exist" error on first boot.
5. **`api-gateway`** starts after the backend services, and **`frontend`**
   starts after the gateway, since the gateway is the only thing the
   frontend's build was told to call.

### 5. Verify it's actually working

```bash
./scripts/health-check.sh
./scripts/smoke-test.sh
```

**Why run both, not just `docker compose ps`:** a container reporting
`healthy` only proves its own `/health` endpoint responds — it says
nothing about whether services can actually talk to *each other* through
the gateway, whether the database schema is correct, or whether the
RabbitMQ event chain (order → payment → order status update →
notification) actually fires end to end. `health-check.sh` confirms every
service is individually alive; `smoke-test.sh` proves the real customer
journey works across all of them together. This is the same two-step check
used in this repo's own verification (see [Verified Run](#verified-run)).

### One command instead of steps 2–4

```bash
./scripts/setup.sh
```

does exactly steps 2–4 (checks prerequisites, creates `.env` if missing,
builds, starts) — provided as a shortcut once you understand what it's
doing.

---

## Where to access things, and how to log in

| What | URL | Notes |
|---|---|---|
| **Storefront + admin UI** | http://localhost:5173 | Start here in a browser. |
| **API Gateway** (all `/api/*` routes) | http://localhost:3000/api | What the frontend talks to. |
| **RabbitMQ management UI** | http://localhost:15672 | Login with `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS` from your `.env` (defaults: `ecommerce_dev` / `change_me_dev_only`) — useful for watching queues/exchanges live. |
| **PostgreSQL** | `localhost:5432` | Connect with any client using `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` from `.env`. |
| **Redis** | `localhost:6379` | `redis-cli -h localhost` to inspect cached product keys. |
| Individual backend services | `localhost:3001`–`3005` | Exposed directly too, for debugging with `curl` without going through the gateway. |

Seeded accounts — **development credentials only, never reuse these
anywhere real** (defined in [database/seeds/seed.js](database/seeds/seed.js)):

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@example.com` | `Admin123!` |
| CUSTOMER | `customer@example.com` | `Customer123!` |

Log in as `admin@example.com` to reach the admin dashboard (KPIs, product,
category, order, payment, and inventory reporting, and user management);
log in as the customer account (or register your own) to shop.

---

## Verified Run

The commands above were actually executed against this repository. Summary
of what was observed (not claimed — run):

```
$ docker compose -f docker/docker-compose.yml ps
NAME                                            STATUS
cloud-native-ecommerce-api-gateway-1            Up (healthy)
cloud-native-ecommerce-frontend-1               Up (healthy)
cloud-native-ecommerce-notification-service-1   Up (healthy)
cloud-native-ecommerce-order-service-1          Up (healthy)
cloud-native-ecommerce-payment-service-1        Up (healthy)
cloud-native-ecommerce-postgres-1               Up (healthy)
cloud-native-ecommerce-product-service-1        Up (healthy)
cloud-native-ecommerce-rabbitmq-1               Up (healthy)
cloud-native-ecommerce-redis-1                  Up (healthy)
cloud-native-ecommerce-user-service-1           Up (healthy)

$ ./scripts/health-check.sh
PASS  api-gateway /health            PASS  api-gateway /ready
PASS  user-service /health           PASS  user-service /ready
PASS  product-service /health        PASS  product-service /ready
PASS  order-service /health          PASS  order-service /ready
PASS  payment-service /health        PASS  payment-service /ready
PASS  notification-service /health   PASS  notification-service /ready
PASS  frontend /health
All health checks passed.

$ ./scripts/smoke-test.sh
==> Registering test user
==> Logging in
==> Listing products
==> Creating an order for product 984548d5-...
==> Paying for order 93adf12e-... (simulated)
    Payment status: SUCCESS
==> Fetching order details
==> Checking notifications
SMOKE TEST PASSED
```

Also confirmed manually: after the simulated payment succeeded, the order
was auto-transitioned `PENDING → CONFIRMED` purely by the `payment.success`
RabbitMQ event (no direct HTTP call from payment-service to order-service),
and `order.created` / `payment.success` / `order.confirmed` all appeared as
recorded rows via `GET /api/notifications` — proving the event-driven path
actually works, not just the request/response paths.

Getting to this point surfaced and fixed three real bugs (an API Gateway
path-rewrite issue, a missing RabbitMQ consumer retry on startup, and a
breaking change in a proxy library's error-handling API) — see
[docs/troubleshooting/troubleshooting.md](docs/troubleshooting/troubleshooting.md)
for details if you hit something similar.

---

## Common commands

```bash
# Watch logs for one service
docker compose -f docker/docker-compose.yml logs -f order-service

# Watch logs for everything
docker compose -f docker/docker-compose.yml logs -f

# Stop the stack (keeps your data)
docker compose -f docker/docker-compose.yml down

# Rebuild and restart one service after changing its code
docker compose -f docker/docker-compose.yml up -d --build user-service

# Full reset — deletes Postgres/Redis/RabbitMQ data and starts clean
./scripts/reset-local.sh
```

More detail (running a service outside Docker for faster iteration,
manual migration/seed commands, per-service `npm test`): see
[docs/development/local-development.md](docs/development/local-development.md).

## Testing

Each service has its own `npm test` (Jest + Supertest, or Vitest for the
frontend) with the database/Redis/RabbitMQ boundaries mocked — meaning
tests run without any live infrastructure. All 62 backend tests and the
frontend unit tests pass as of the verified run above. End-to-end
verification against the real running stack is `scripts/health-check.sh`
and `scripts/smoke-test.sh`. Full guide:
[docs/testing/testing-guide.md](docs/testing/testing-guide.md).

## API Documentation

OpenAPI specification: [docs/api/openapi.yaml](docs/api/openapi.yaml).
Human-readable reference: [docs/api/api-documentation.md](docs/api/api-documentation.md).

## Troubleshooting

### `docker compose up` fails immediately

- Confirm Docker Desktop / the Docker daemon is actually running: `docker info`.
- Confirm you're using Compose v2: `docker compose version` (not the
  standalone `docker-compose` v1 binary).
- Run from the **repository root**, not from inside `docker/` — the
  compose file uses `../` relative paths and expects `.env` to be
  discoverable from the current working directory.

### A service is stuck "unhealthy" or restarting

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f <service-name>
```

Common causes:

- **Postgres not ready yet**: app services `depends_on: postgres:
  condition: service_healthy`, so this should self-resolve; if it doesn't,
  check `docker compose logs postgres` for a crash loop (often a bad
  `POSTGRES_PASSWORD`/volume permission mismatch after changing `.env`
  without resetting the volume — see below).
- **Missing required env var**: every service's `config/env.js` fails
  fast with a clear "Missing required environment variables: X, Y"
  message on boot if `.env` is incomplete. Check `docker compose logs`
  for that exact message.

### "Missing required environment variables" on startup

Your `.env` is missing a key its `.env.example` declares. Diff them:

```bash
diff <(grep -oE '^[A-Z_]+=' .env | sort) <(grep -oE '^[A-Z_]+=' .env.example | sort)
```

### Changed `.env` (e.g. Postgres password) but Postgres still uses the old one

Postgres only applies `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` on
first initialization of its data volume. If you change these after the
volume already exists, either:

```bash
docker compose -f docker/docker-compose.yml down -v   # deletes local data
docker compose -f docker/docker-compose.yml up -d
```

or use `./scripts/reset-local.sh`, which does this with a confirmation prompt.

### `migrate` or `seed` service keeps failing

```bash
docker compose -f docker/docker-compose.yml logs migrate
docker compose -f docker/docker-compose.yml logs seed
```

- If it can't connect: Postgres isn't actually healthy yet — check
  `docker compose logs postgres`.
- If a migration fails partway: each migration runs inside a transaction
  and is rolled back on error, so the `schema_migrations` table won't show
  it as applied. Fix the migration file and re-run `docker compose up
  migrate` (or `npm run migrate:up` locally).

### RabbitMQ consumer not processing messages

- Check the management UI at http://localhost:15672 (seeded credentials
  from `.env`: `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`) —
  inspect queue depth on `order.queue`, `payment.queue`,
  `notification.queue`, and their `.dlq` counterparts.
- Messages piling up in a `.dlq` mean the consumer threw on every retry (3
  attempts, 5s apart) — check that service's logs for the actual error,
  then fix and manually requeue from the management UI if needed.

### Frontend shows "Network Error" / can't reach the API

- Confirm `VITE_API_BASE_URL` (baked in at build time for the Docker
  image, or from `frontend/.env.local` in dev mode) actually points at
  the gateway's reachable address from the browser's perspective —
  `http://localhost:3000/api` when running via Docker Compose on the same
  machine.
- Check the gateway's own readiness: `curl http://localhost:3000/ready` —
  it aggregates a health ping to all 5 downstream services and reports
  which one is unreachable.

### Port already in use

Another process (or a previous, not-fully-stopped Compose stack) is bound
to one of the host ports in `.env`. Either stop that process or change the
corresponding `*_PORT` variable in `.env` and re-run `docker compose up -d`.

### Tests fail with "connect ECONNREFUSED" instead of running against mocks

You're likely running a test file directly with a bare test runner instead
of `npm test`, which skips the Jest `setupFiles` entry
(`tests/env.setup.js`) that seeds required env vars and lets
`jest.mock(...)` calls at the top of each test file take effect. Always
use `npm test` from the service directory.

### `permission denied` running `docker` commands

Your user isn't in the `docker` group yet:

```bash
sudo usermod -aG docker $USER
```

Then **log out and back in** (or run `newgrp docker` in your current
shell) — group membership doesn't apply to already-open sessions.

### Known bugs already found and fixed during real end-to-end verification

Documented here in case similar changes (upgrading a library, editing the
gateway routes) reintroduce something like them:

- **API Gateway forwarded requests to the wrong path (404 on every
  proxied route).** Express strips the `app.use()` mount prefix from
  `req.url` before `http-proxy-middleware` ever sees it. Fixed in
  [services/api-gateway/src/routes/proxy.js](services/api-gateway/src/routes/proxy.js)
  by rewriting `^/` → `/auth/` (prepend the upstream's own base path)
  instead of trying to replace a prefix that's already gone.
- **Proxy errors returned plain text with a 504 instead of the app's JSON
  error envelope with a 502.** `http-proxy-middleware` v3 moved its error
  handler from a top-level `onError` option to `on: { error }`; the old
  key is silently accepted and ignored. Fixed in the same `proxy.js`.
- **RabbitMQ consumers permanently failed to start if they lost a narrow
  startup race.** `depends_on: rabbitmq: condition: service_healthy`
  narrows but doesn't eliminate the race. Fixed by adding bounded
  retry-with-backoff (10 attempts, 2s apart) inside `connect()` in
  `config/rabbitmq.js` for order-service, payment-service, and
  notification-service.
- **Frontend container reported `unhealthy` despite serving requests
  correctly.** The `nginx-unprivileged` base image only listened on IPv4,
  so the healthcheck's `wget http://localhost:8080/health` resolved to
  `::1` and got connection-refused. Fixed by adding `listen [::]:8080;`
  to [frontend/nginx.conf](frontend/nginx.conf) and pointing the
  healthcheck at `127.0.0.1` explicitly.

Full troubleshooting guide (more detail on each item above):
[docs/troubleshooting/troubleshooting.md](docs/troubleshooting/troubleshooting.md).

## License

MIT — see [LICENSE](LICENSE).
