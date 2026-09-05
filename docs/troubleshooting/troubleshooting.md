# Troubleshooting

## Bugs found and fixed during real end-to-end verification

These aren't hypothetical — they were reproduced by actually running the
stack, and the fixes are already in this codebase. Documented here in case
similar changes (upgrading a library, editing the gateway routes) reintroduce
something like them.

**API Gateway forwarded requests to the wrong path (404 on every proxied
route).** Express strips the `app.use()` mount prefix from `req.url` before
`http-proxy-middleware` ever sees it — a request to `/api/auth/register`
arrives at the proxy as just `/register`, not `/api/auth/register`. The
original `pathRewrite: {'^/api/auth': '/auth'}` therefore never matched
anything. Fixed in [services/api-gateway/src/routes/proxy.js](../../services/api-gateway/src/routes/proxy.js)
by rewriting `^/` → `/auth/` (prepend the upstream's own base path) instead
of trying to replace a prefix that's already gone.

**Proxy errors returned plain text with a 504 instead of the app's JSON
error envelope with a 502.** `http-proxy-middleware` v3 moved its error
handler from a top-level `onError` option to `on: { error }`; the old key
is silently accepted and silently ignored, so the gateway was falling back
to the library's own default handler the whole time. Fixed in the same
`proxy.js` — verified live by stopping `payment-service` and confirming
`curl http://localhost:3000/api/payments/...` returns a proper
`{"success":false,"error":{"code":"BAD_GATEWAY",...}}` at `502`.

**RabbitMQ consumers permanently failed to start if they lost a narrow
startup race.** `depends_on: rabbitmq: condition: service_healthy`
narrows the race between a service starting and RabbitMQ actually being
ready, but doesn't eliminate it. Publish calls self-heal (a failed
connection attempt never caches the channel, so the next `publish()` just
retries) — but each service's one-shot `consumer.start()` call at boot had
no such second chance. Fixed by adding bounded retry-with-backoff (10
attempts, 2s apart) inside `connect()` in `config/rabbitmq.js` for
order-service, payment-service, and notification-service.

**Frontend container reported `unhealthy` despite serving requests
correctly.** The `nginx-unprivileged` base image's IPv6-listen setup script
couldn't patch the custom `default.conf` baked into the image at build
time (permission denied for the non-root runtime user), so nginx only
listened on IPv4. The `HEALTHCHECK`'s `wget http://localhost:8080/health`
resolved `localhost` to `::1` first and got connection-refused, while
external `curl` traffic happened to arrive over IPv4 and worked fine.
Fixed by adding `listen [::]:8080;` to
[frontend/nginx.conf](../../frontend/nginx.conf) and pointing the
healthcheck at `127.0.0.1` explicitly in
[frontend/Dockerfile](../../frontend/Dockerfile) to remove the DNS-order
ambiguity entirely.

## `docker compose up` fails immediately

- Confirm Docker Desktop / the Docker daemon is actually running:
  `docker info`.
- Confirm you're using Compose v2: `docker compose version` (not the
  standalone `docker-compose` v1 binary).
- Run from the **repository root**, not from inside `docker/` — the
  compose file uses `../` relative paths and expects `.env` to be
  discoverable from the current working directory.

## A service is stuck "unhealthy" or restarting

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f <service-name>
```

Common causes:

- **Postgres not ready yet**: app services `depends_on: postgres:
  condition: service_healthy`, so this should self-resolve; if it
  doesn't, check `docker compose logs postgres` for a crash loop
  (often a bad `POSTGRES_PASSWORD`/volume permission mismatch after
  changing `.env` without resetting the volume — see below).
- **Missing required env var**: every service's `config/env.js` fails
  fast with a clear "Missing required environment variables: X, Y"
  message on boot if `.env` is incomplete. Check `docker compose logs`
  for that exact message.

## "Missing required environment variables" on startup

Your `.env` is missing a key its `.env.example` declares. Diff them:

```bash
diff <(grep -oE '^[A-Z_]+=' .env | sort) <(grep -oE '^[A-Z_]+=' .env.example | sort)
```

## Changed `.env` (e.g. Postgres password) but Postgres still uses the old one

Postgres only applies `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` on
first initialization of its data volume. If you change these after the
volume already exists, either:

```bash
docker compose -f docker/docker-compose.yml down -v   # deletes local data
docker compose -f docker/docker-compose.yml up -d
```

or use `./scripts/reset-local.sh`, which does this with a confirmation
prompt.

## `migrate` or `seed` service keeps failing

```bash
docker compose -f docker/docker-compose.yml logs migrate
docker compose -f docker/docker-compose.yml logs seed
```

- If it can't connect: Postgres isn't actually healthy yet — check
  `docker compose logs postgres`.
- If a migration fails partway: each migration runs inside a transaction
  and is rolled back on error, so the `schema_migrations` table won't
  show it as applied. Fix the migration file and re-run
  `docker compose up migrate` (or `npm run migrate:up` locally).

## RabbitMQ consumer not processing messages

- Check the management UI at http://localhost:15672 (seeded credentials
  from `.env`: `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`) —
  inspect queue depth on `order.queue`, `payment.queue`,
  `notification.queue`, and their `.dlq` counterparts.
- Messages piling up in a `.dlq` mean the consumer threw on every retry
  (3 attempts, 5s apart) — check that service's logs for the actual
  error, then fix and manually requeue from the management UI if needed.

## Frontend shows "Network Error" / can't reach the API

- Confirm `VITE_API_BASE_URL` (baked in at build time for the Docker
  image, or from `frontend/.env.local` in dev mode) actually points at
  the gateway's reachable address from the browser's perspective —
  `http://localhost:3000/api` when running via Docker Compose on the same
  machine.
- Check the gateway's own readiness: `curl http://localhost:3000/ready`
  — it aggregates a health ping to all 5 downstream services and reports
  which one is unreachable.

## Port already in use

Another process (or a previous, not-fully-stopped Compose stack) is
bound to one of the host ports in `.env`. Either stop that process or
change the corresponding `*_PORT` variable in `.env` and re-run
`docker compose up -d`.

## Tests fail with "connect ECONNREFUSED" instead of running against mocks

You're likely running a test file directly with a bare test runner
instead of `npm test`, which skips the Jest `setupFiles` entry
(`tests/env.setup.js`) that seeds required env vars and lets
`jest.mock(...)` calls at the top of each test file take effect. Always
use `npm test` from the service directory.
