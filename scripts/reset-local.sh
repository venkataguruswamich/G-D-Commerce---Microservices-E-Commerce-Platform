#!/usr/bin/env bash
# Tears down the local stack INCLUDING volumes (Postgres/Redis/RabbitMQ
# data is deleted) and brings it back up from a clean state. Prompts for
# confirmation since this is destructive to local data.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "This will DELETE all local Postgres/Redis/RabbitMQ data volumes."
read -r -p "Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d

echo "Local environment reset. Run scripts/health-check.sh to verify."
