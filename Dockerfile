FROM python:3.12-slim

# Base runtime environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1 \
        PIP_NO_CACHE_DIR=1 \
        PORT=5000 \
        DJANGO_SETTINGS_MODULE=config.settings_prod

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/ /app/

RUN chmod +x entrypoint.sh
ENV PORT=5000
EXPOSE 5000

# Lightweight container healthcheck hitting internal Gunicorn via /health/.
# Uses curl (installed earlier) with a short timeout. If DJANGO_SETTINGS_MODULE misconfigured
# or app failing to boot, this will mark the task unhealthy quickly.
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
        CMD curl -fsS "http://127.0.0.1:${PORT:-5000}/health/" || exit 1

ENTRYPOINT ["./entrypoint.sh"]
