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
  - DJANGO_SECRET_KEY=... (SSM secret)
  - DJANGO_ALLOWED_HOSTS=api.example.com
  - CORS_ALLOWED_ORIGINS=https://www.example.com
  - CSRF_TRUSTED_ORIGINS=https://www.example.com
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
3. ALB target group health check path: `/health/` or `/admin/login/` (ensure public route exists).
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
