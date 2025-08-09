#!/usr/bin/env bash
set -e

# Lancer le worker RQ en arrière-plan
rq worker --url "${REDIS_URL}" "${RQ_QUEUE_NAME:-mvp_jobs}" &

# Lancer l'API FastAPI
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000
