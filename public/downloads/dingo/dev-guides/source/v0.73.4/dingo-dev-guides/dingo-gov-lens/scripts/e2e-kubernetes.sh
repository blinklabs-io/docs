#!/usr/bin/env bash
set -euo pipefail

POSTGRES_NAMESPACE="${POSTGRES_NAMESPACE:?Set the PostgreSQL Kubernetes namespace}"
POSTGRES_POD="${POSTGRES_POD:?Set the PostgreSQL pod name}"
POSTGRES_DB="${POSTGRES_DB:-dingo_metadata}"
POSTGRES_USER="${POSTGRES_USER:-dingo}"
GOV_LENS_PORT="${GOV_LENS_PORT:-${APP_PORT:-8088}}"

status_file="$(mktemp "${TMPDIR:-/tmp}/dingo-gov-lens-status.XXXXXX")"
trap 'rm -f "${status_file}"' EXIT

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${GOV_LENS_PORT}/api/status" >"${status_file}"; then
    break
  fi
  sleep 2
done

curl -fsS "http://127.0.0.1:${GOV_LENS_PORT}/api/status" | jq .

kubectl -n "${POSTGRES_NAMESPACE}" exec "${POSTGRES_POD}" -- psql \
  --set ON_ERROR_STOP=1 \
  --username "${POSTGRES_USER}" \
  --dbname "${POSTGRES_DB}" \
  --tuples-only \
  --command "SELECT network, storage_mode FROM node_settings WHERE id = 1;" |
  awk '{ gsub(/^ +| +$/, ""); print }'

kubectl -n "${POSTGRES_NAMESPACE}" exec "${POSTGRES_POD}" -- psql \
  --set ON_ERROR_STOP=1 \
  --username "${POSTGRES_USER}" \
  --dbname "${POSTGRES_DB}" \
  --command "SELECT (SELECT COUNT(*) FROM drep) AS dreps, (SELECT COUNT(*) FROM governance_proposal) AS proposals;"
