# AWS Elastic Beanstalk Deployment (Single Docker)\n\nProduction deployment of the Django backend container. Frontend (Vite) is assumed to be hosted separately (e.g. S3/CloudFront).\n\n## Environment Variables (Required)\n\n| Name | Description | Example |
|------|-------------|---------|
| `DJANGO_SETTINGS_MODULE` | Must point to production settings | `config.settings_prod` |
| `SECRET_KEY` | Django secret key (strong, random, never commit) | `django-insecure-...` |
| `DATABASE_URL` | Postgres URL including `sslmode=require` | `postgres://user:pass@host:5432/dbname?sslmode=require` |
| `PORT` | Port gunicorn binds (Elastic Beanstalk maps) | `5000` |
| `WEB_CONCURRENCY` | Gunicorn worker count | `3` |
| `ALLOWED_HOSTS` | (Optional override) Comma list of hosts (if not fixed in prod settings) | `api.example.com,www.example.com` |
| `CORS_ALLOWED_ORIGINS` | (Optional override) Comma list for CORS | `https://example.com,https://www.example.com` |
| `AWS_STORAGE_BUCKET_NAME` | (Optional) Enable S3 media/static | `my-bucket` |
| `AWS_S3_REGION_NAME` | Region for bucket | `us-east-1` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | If not using EC2 role | `<keys>` |

## Health Endpoints\n\n| Path | Purpose | Touches DB | Response |
|------|---------|-----------|----------|
| `/health` | Liveness (ALB target group) | No | `{ "app": "ok" }` |
| `/db/health` | DB connectivity diagnostic | Yes | `{ "db": "ok" }` |
\nNginx layer returns `200 ok` immediately for `/health` and `/health/`. Django still serves JSON for observability. Both `/health` variants are exempt from HTTPS redirect.\n\n## Deployment Flow\n\n1. Build Docker image locally (optional validation).\n2. Push to ECR (if using external registry) or let EB build from `Dockerfile`.\n3. Create EB application + environment (single Docker platform).\n4. Configure environment variables (see table).\n5. Upload application version (Dockerrun or source bundle).\n6. EB deploys container; health check should go green within seconds.\n7. Verify logs: migrations + collectstatic executed at startup.\n8. (Optional) Point Route53 / DNS to EB load balancer CNAME.\n\n## Post-Deploy Checklist\n\n- [ ] ALB Target Group health = healthy (HTTP 200, no redirects)\n- [ ] Accessing `/health` returns `{ "app": "ok" }` over HTTPS and HTTP (HTTP only used internally)\n- [ ] Accessing `/db/health` returns `{ "db": "ok" }`\n- [ ] Static files served (WhiteNoise) return 200 with proper Cache-Control\n- [ ] HSTS headers present (max-age 31536000, includeSubDomains, preload)\n- [ ] Cookies (if any) have `Secure` and `HttpOnly` flags\n- [ ] CORS only allows intended frontend origins\n- [ ] Database connections stable (no rapid churn in logs)\n- [ ] Gunicorn worker count matches `WEB_CONCURRENCY`\n- [ ] No ImportError for `core.middleware.HealthNoSSLRedirectMiddleware`\n- [ ] Migrations executed (check DB schema)\n- [ ] Media uploads (if S3 enabled) succeed\n\n## Updating\n\n1. Bump image / push new source bundle.\n2. EB deploy new version (rolling update).\n3. Confirm `/health` remains stable during rollout.\n\n## Rolling Back\n\nUse EB console: select previous application version and redeploy.\n\n## Local Smoke Test\n\n```bash
# Build
docker build -t app-backend .
# Run
docker run -p 5000:5000 -e DJANGO_SETTINGS_MODULE=config.settings_prod -e SECRET_KEY=dev -e DATABASE_URL=postgres://... app-backend
# Test health
curl -s localhost:5000/health | jq
```
\n## Notes\n\n- `/db/health` should not be used by frequent ALB health checks to avoid extra DB load.\n- Switch to S3 (django-storages) only after verifying local static collection works.\n- Consider enabling Gunicorn `--graceful-timeout` if using slow DB migrations on deploy.\n- For large media, offload direct uploads via pre-signed S3 URLs.\n