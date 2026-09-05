#!/usr/bin/env bash
# Local development bootstrap: verifies prerequisites, creates .env if
# missing, and brings up the full stack via Docker Compose.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Checking prerequisites"
for tool in docker git; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "ERROR: required tool '$tool' is not installed." >&2
    exit 1
  fi
done

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: 'docker compose' (v2 plugin) is not available." >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
  echo "    Edit .env if you need non-default values."
else
  echo "==> .env already exists, leaving it as-is"
fi

echo "==> Building images"
docker compose -f docker/docker-compose.yml build

echo "==> Starting services"
docker compose -f docker/docker-compose.yml up -d

echo "==> Done. Run scripts/health-check.sh to verify all services are healthy."
