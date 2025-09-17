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
RUN pip install --no-cache-dir -r /app/requirements.txt && \
    pip install --no-cache-dir gunicorn boto3 django-storages

# Copy only backend code from repo root context
COPY backend/ ./

# Port
EXPOSE 8000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('127.0.0.1',8000)); s.close()" || exit 1

# Default environment
ENV DJANGO_SETTINGS_MODULE=config.settings_prod

# Entrypoint
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]
