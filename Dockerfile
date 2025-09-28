FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1 \
        PIP_NO_CACHE_DIR=1 \
        PORT=5000

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


# Health handled at Nginx/ALB layer; container self-check disabled to avoid false negatives
HEALTHCHECK NONE


ENTRYPOINT ["./entrypoint.sh"]
