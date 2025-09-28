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
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import os,urllib.request,sys; u='http://127.0.0.1:%s/health/'%os.getenv('PORT','5000'); sys.exit(0 if 200<=urllib.request.urlopen(u,timeout=4).getcode()<300 else 1)"


ENTRYPOINT ["./entrypoint.sh"]
