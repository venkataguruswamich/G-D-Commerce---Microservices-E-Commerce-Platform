#!/usr/bin/env bash
# End-to-end smoke test against the API Gateway: register, login, browse
# products, place an order, simulate payment, and check notifications.
# Requires: curl, jq. Requires the stack to already be up (scripts/setup.sh).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

for tool in curl jq; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "ERROR: required tool '$tool' is not installed." >&2
    exit 1
  fi
done

BASE_URL="http://localhost:${API_GATEWAY_PORT:-3000}/api"
EMAIL="smoketest+$(date +%s)@example.com"
PASSWORD="SmokeTest123!"

step() { echo; echo "==> $1"; }
fail() { echo "SMOKE TEST FAILED: $1" >&2; exit 1; }

step "Registering test user ($EMAIL)"
curl -sf -X POST "$BASE_URL/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"Smoke\",\"lastName\":\"Test\"}" \
  > /dev/null || fail "registration"

step "Logging in"
LOGIN_RESPONSE=$(curl -sf -X POST "$BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}") || fail "login"
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
[ "$ACCESS_TOKEN" != "null" ] || fail "no access token returned"

step "Listing products"
PRODUCTS_RESPONSE=$(curl -sf "$BASE_URL/products?limit=1") || fail "list products"
PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.items[0].id')
[ "$PRODUCT_ID" != "null" ] && [ -n "$PRODUCT_ID" ] || fail "no products available — did the seed job run?"

step "Creating an order for product $PRODUCT_ID"
ORDER_RESPONSE=$(curl -sf -X POST "$BASE_URL/orders" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}],\"shippingAddress\":{\"line1\":\"1 Test St\",\"city\":\"Testville\",\"state\":\"TS\",\"postalCode\":\"00000\",\"country\":\"US\"}}") \
  || fail "create order"
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.id')
[ "$ORDER_ID" != "null" ] || fail "no order id returned"

step "Paying for order $ORDER_ID (simulated)"
PAYMENT_RESPONSE=$(curl -sf -X POST "$BASE_URL/payments" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"orderId\":\"$ORDER_ID\"}") || fail "create payment"
PAYMENT_STATUS=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.status')
echo "    Payment status: $PAYMENT_STATUS"

step "Fetching order details"
curl -sf "$BASE_URL/orders/$ORDER_ID" -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null || fail "get order"

step "Checking notifications"
curl -sf "$BASE_URL/notifications" -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null || fail "list notifications"

echo
echo "SMOKE TEST PASSED"
