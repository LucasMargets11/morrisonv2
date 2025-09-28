#!/usr/bin/env sh
set -euo pipefail

# Defaults (can be overridden via environment)
export PORT="${PORT:-5000}"
export WEB_CONCURRENCY="${WEB_CONCURRENCY:-3}"
export GUNICORN_TIMEOUT="${GUNICORN_TIMEOUT:-120}"

echo "[entrypoint] Applying migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput

echo "[entrypoint] Starting gunicorn on 0.0.0.0:${PORT} (workers=${WEB_CONCURRENCY}, timeout=${GUNICORN_TIMEOUT})"
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:${PORT} \
  --workers ${WEB_CONCURRENCY} \
  --timeout ${GUNICORN_TIMEOUT} \
  --access-logfile - \
  --error-logfile - \
  --forwarded-allow-ips="*" \
  --proxy-allow-from="*"
