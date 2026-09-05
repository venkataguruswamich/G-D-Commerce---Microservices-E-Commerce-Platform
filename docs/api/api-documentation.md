# API Documentation

Full machine-readable spec: [openapi.yaml](openapi.yaml). This document is a
human-readable companion, not a duplicate — see the OpenAPI file for exact
request/response schemas.

All requests go through the API Gateway at `http://localhost:3000/api` in
local development. All responses share this envelope:

```json
{ "success": true, "data": { }, "requestId": "..." }
```

or, on error:

```json
{ "success": false, "error": { "code": "...", "message": "..." }, "requestId": "..." }
```

Authenticated endpoints require `Authorization: Bearer <accessToken>`.

## Auth (user-service, via `/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | none | Create a CUSTOMER account |
| POST | `/auth/login` | none | Returns `accessToken` + `refreshToken` |
| POST | `/auth/refresh` | none | Rotates the refresh token, issues a new access token |
| POST | `/auth/logout` | none | Revokes the given refresh token |

## Users (user-service, via `/api/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | any authenticated user | Own profile |
| PUT | `/users/me` | any authenticated user | Update own first/last name |
| GET | `/users` | ADMIN | Paginated user list |
| GET | `/users/:id` | ADMIN | Single user |

## Products & Categories (product-service, via `/api/products`, `/api/categories`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | none | Search/filter/sort/paginate |
| GET | `/products/:id` | none | Single product (Redis cache-aside, TTL from `PRODUCT_CACHE_TTL_SECONDS`) |
| POST | `/products` | ADMIN | Create |
| PUT | `/products/:id` | ADMIN | Update (invalidates cache) |
| DELETE | `/products/:id` | ADMIN | Delete (invalidates cache) |
| GET | `/products/:id/inventory` | none | Stock level |
| PUT | `/products/:id/inventory` | ADMIN | Set stock level |
| GET | `/products/inventory` | ADMIN | Paginated stock overview across all products |
| GET | `/categories` | none | List |
| POST/PUT/DELETE | `/categories[/:id]` | ADMIN | Manage |

## Orders (order-service, via `/api/orders`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | any authenticated user | Creates an order from cart items; server fetches authoritative pricing from product-service |
| GET | `/orders` | any authenticated user | Own orders (CUSTOMER) or all orders (ADMIN) |
| GET | `/orders/:id` | owner or ADMIN | Order with line items |
| PUT | `/orders/:id/status` | ADMIN | Transition status (enforces the state machine below) |

Status state machine:

```
PENDING → CONFIRMED | PROCESSING | CANCELLED
CONFIRMED → PROCESSING | CANCELLED
PROCESSING → SHIPPED | CANCELLED
SHIPPED → DELIVERED
DELIVERED, CANCELLED → (terminal)
```

`PENDING` orders also auto-transition to `CONFIRMED`/`CANCELLED` when
payment-service reports `payment.success`/`payment.failed` over RabbitMQ.

## Payments (payment-service, via `/api/payments`) — DEMO ONLY

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments` | any authenticated user | Simulated payment for a `PENDING` order you own |
| GET | `/payments` | ADMIN | Paginated payment list, optional `status` filter |
| GET | `/payments/:id` | owner or ADMIN | Payment record |

No real payment processor is contacted and no real funds move. The outcome
is a deterministic function of `(orderId, amountCents)` — see
[paymentSimulator.js](../../services/payment-service/src/utils/paymentSimulator.js).

## Notifications (notification-service, via `/api/notifications`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | any authenticated user | Own notifications (CUSTOMER) or all (ADMIN) |

Notifications are created by consuming RabbitMQ events
(`order.created`, `order.confirmed`, `order.shipped`, `order.delivered`,
`payment.success`, `payment.failed`), not via a write endpoint.

## Health & Readiness

Every service exposes `GET /health` (liveness) and `GET /ready`
(dependency check — Postgres/Redis/RabbitMQ as applicable). These are
**not** proxied through the gateway's `/api` prefix; hit them directly on
each service's port, or use `scripts/health-check.sh`.
