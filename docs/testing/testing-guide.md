# Testing Guide

## Per-service unit & integration tests

Every backend service uses Jest + Supertest. Tests mock the database,
Redis, and RabbitMQ modules at the boundary (`jest.mock('../../src/config/...')`)
so they run without any live infrastructure — this is what makes them
runnable in CI without spinning up Postgres/Redis/RabbitMQ.

```bash
cd services/<service-name>
npm install
npm test                # run once
npm run test:coverage   # with coverage report
```

Frontend uses Vitest + React Testing Library:

```bash
cd frontend
npm install
npm test
```

## What's covered per service

| Service | Key test coverage |
|---|---|
| user-service | registration validation/conflict, login success/failure, JWT issuance, health/ready |
| product-service | search/pagination validation, 404s, RBAC (401/403/201), Redis cache-aside hit/miss/failure-fallback |
| order-service | auth requirement, unavailable-product rejection, total computed from authoritative price, ownership checks, status-transition guard, payment-event consumer (confirm/cancel/ignore logic) |
| payment-service | deterministic outcome simulation, 404/403/409 guards, `payment.queue` consumer |
| notification-service | delivery success (SENT), delivery failure (FAILED, not rethrown), DB failure (rethrown for RabbitMQ retry), role-scoped listing |
| api-gateway | JWT edge validation, 401 before proxy, 502 on unreachable downstream, 404 fallback |
| frontend | money formatting, error banner rendering/retry, cart add/update/persistence |

## End-to-end verification (requires the stack running)

```bash
./scripts/health-check.sh   # liveness + readiness of every service
./scripts/smoke-test.sh     # full golden path via the API Gateway
```

## Manual golden-path checklist (browser)

1. Register a new account, then log in.
2. Browse `/products`, use search/filter/sort/pagination.
3. Open a product, add to cart, adjust quantity.
4. Checkout with a shipping address — order is created, payment is
   simulated, and you land on the order details page.
5. Refresh the order details page — status should reflect the payment
   outcome (`CONFIRMED` or `CANCELLED`) once the RabbitMQ event has been
   processed (usually near-instant locally).
6. Log in as the seeded admin, visit `/admin`, manage products/orders/users.

## Known gap at time of writing

This entire test suite was authored and statically validated (JSON/brace
balance, no import errors visible by inspection) but has **not yet been
executed** — the development environment used to build this repository
did not have Node.js or Docker installed. Before relying on this as a
passing test suite, run it for real:

```bash
./scripts/setup.sh
./scripts/health-check.sh
./scripts/smoke-test.sh
# then, for each service:
cd services/<service-name> && npm install && npm test
cd frontend && npm install && npm test
```
