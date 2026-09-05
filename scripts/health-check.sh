#!/usr/bin/env bash
# Verifies /health and /ready on every service. Exits non-zero if any check
# fails, printing which service and endpoint failed.
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

HOST="${HEALTH_CHECK_HOST:-localhost}"

declare -A SERVICES=(
  [api-gateway]="${API_GATEWAY_PORT:-3000}"
  [user-service]="${USER_SERVICE_PORT:-3001}"
  [product-service]="${PRODUCT_SERVICE_PORT:-3002}"
  [order-service]="${ORDER_SERVICE_PORT:-3003}"
  [payment-service]="${PAYMENT_SERVICE_PORT:-3004}"
  [notification-service]="${NOTIFICATION_SERVICE_PORT:-3005}"
)

failures=0

check() {
  local name="$1" url="$2"
  if curl -sf -o /dev/null --max-time 5 "$url"; then
    echo "PASS  $name  $url"
  else
    echo "FAIL  $name  $url"
    failures=$((failures + 1))
  fi
}

for service in "${!SERVICES[@]}"; do
  port="${SERVICES[$service]}"
  check "$service /health" "http://${HOST}:${port}/health"
  check "$service /ready" "http://${HOST}:${port}/ready"
done

check "frontend /health" "http://${HOST}:${FRONTEND_PORT:-5173}/health"

echo "---"
if [ "$failures" -eq 0 ]; then
  echo "All health checks passed."
  exit 0
else
  echo "$failures health check(s) failed."
  exit 1
fi
