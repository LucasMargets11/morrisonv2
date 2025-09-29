# AWS Deployment Guide

This document outlines a reference architecture and concrete steps to deploy this app to AWS.

## Reference architecture
- Frontend (React/Vite):
  - S3 bucket for static site hosting
  - CloudFront CDN with custom domain (Route 53) and ACM TLS
- Backend (Django + DRF):
  - Containerized with Docker + Gunicorn
  - ECS Fargate service behind an Application Load Balancer (ALB)
  - Private subnets for tasks; public subnets for ALB
  - CloudWatch logs
- Database:
  - Amazon RDS for PostgreSQL (private subnets)
- Media/static assets:
  - S3 via django-storages (bucket shared with or separate from frontend)
- Secrets/config:
  - SSM Parameter Store or Secrets Manager

## Environment variables (examples)
- General
  - DJANGO_SETTINGS_MODULE=config.settings_prod
  - DJANGO_DEBUG=false (only set true in non-prod debugging; container now reads DJANGO_DEBUG/DEBUG)
  - DJANGO_SECRET_KEY=... (SSM secret)
  - DJANGO_ALLOWED_HOSTS=api.example.com,admin.example.com (comma separated; legacy ALLOWED_HOSTS still supported)
  - CORS_ALLOWED_ORIGINS=https://www.example.com
  - CSRF_TRUSTED_ORIGINS=https://www.example.com
  - PORT=5000 (container internal gunicorn bind, defaults to 5000)
- AWS storage
  - AWS_STORAGE_BUCKET_NAME=app-media-prod
  - AWS_S3_REGION_NAME=us-east-1
  - AWS_S3_CUSTOM_DOMAIN=cdn.example.com (CloudFront, optional)
  - AWS_STATIC_LOCATION=static
  - AWS_MEDIA_LOCATION=media
- Database
  - DB_HOST=...
  - DB_PORT=5432
  - DB_NAME=...
  - DB_USER=...
  - DB_PASSWORD=... (Secrets Manager/SSM)
- Security
  - SECURE_SSL_REDIRECT=true
  - SECURE_HSTS_SECONDS=31536000

## Backend build & deploy
1. Build image and push to ECR.
2. Create ECS Fargate cluster and service with task definition:
   - Container port 8000
   - Env vars from SSM/Secrets
   - Logging to CloudWatch
3. ALB target group health check path: `/health/` (fast Nginx 200). Avoid using admin path for health.
4. Add security groups:
   - ALB: 80/443 from Internet
   - ECS: 8000 from ALB SG only
   - RDS: 5432 from ECS SG only

## Frontend build & deploy
1. Set VITE_API_URL=https://api.example.com/api
2. Build with `npm run build`.
3. Sync `dist/` to S3 bucket.
4. Invalidate CloudFront.

## Django specifics
- Use `config/settings_prod.py`.
- Media/static served from S3 via `django-storages`.
- Gunicorn config in `backend/gunicorn.conf.py`.
- Container HEALTHCHECK now queries `http://127.0.0.1:$PORT/health/` every 30s (see Dockerfile) – ensure /health/ remains lightweight and dependency-free.

### (Option B) Media en disco local (Elastic Beanstalk single container)
Si decides NO usar todavía S3 y servir media localmente:
1. `MEDIA_ROOT` apunta a `/app/media` (configurable con `DJANGO_MEDIA_ROOT`).
2. Monta volumen host↔contenedor en `Dockerrun.aws.json`:
```
"Volumes": [
  {
    "HostDirectory": "/var/app/current/media",
    "ContainerDirectory": "/app/media"
  }
]
```
3. Añade `.platform/nginx/conf.d/media.conf`:
```
location /media/ {
    alias /var/app/current/media/;
    access_log off;
    try_files $uri =404;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```
4. Re-deploy. Subidas nuevas aparecerán bajo `/var/app/current/media` y serán servidas por Nginx.

NOTA: Cualquier archivo que estuviera “horneado” dentro de la imagen en `/app/media` quedará oculto al montar el volumen vacío. Si necesitas preservar contenido previo:
```
docker run --rm <image> tar -C /app/media -cf - . | tar -C media_backup -xf -
scp -r media_backup/* ec2:/var/app/current/media/
```
o súbelos nuevamente desde la UI.

### Nginx snippets (Elastic Beanstalk / .platform)
We consolidated upload/body size & timeouts into `proxy.conf` and removed overlapping `01_uploads.conf`. A single `client_max_body_size 50M;` defines upload limit. `02_typeshash.conf` prevents hash bucket warnings.

Required files:
- `.platform/nginx/conf.d/00_health.conf` – returns 200 "ok" for /health and /health/
- `.platform/nginx/conf.d/proxy.conf` – gzip, client_max_body_size, proxy timeouts
- `.platform/nginx/conf.d/02_typeshash.conf` – types_hash_max_size / bucket_size tuning

## CI/CD (sketch)
- GitHub Actions:
  - Backend: build/push ECR, update ECS service
  - Frontend: build, sync to S3, invalidate CloudFront

## Migrations & data
- `python manage.py migrate` runs on startup via entrypoint.
- For media migration: `aws s3 sync backend/media s3://app-media-prod/media/` (one-off).

## Monitoring
- CloudWatch logs + metrics
- ALB 5xx alarms
- RDS CPU/Connections alarms
