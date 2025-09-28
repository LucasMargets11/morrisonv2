# syntax=docker/dockerfile:1
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy only backend code from repo root context
COPY . /app

# Port
ENV PORT=5000
EXPOSE 5000

# Healthcheck (HTTP level hitting /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
    CMD python -c "import urllib.request,sys;\
        u='http://127.0.0.1:' + str(${PORT}) + '/health';\
        req=urllib.request.Request(u);\
        with urllib.request.urlopen(req,timeout=4) as r:\
            sys.exit(0 if (200 <= r.getcode() < 300) else 1)" || exit 1

# Default environment
ENV DJANGO_SETTINGS_MODULE=config.settings_prod

# Entrypoint
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]
