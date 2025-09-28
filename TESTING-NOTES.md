# Deployment & Health Check Verification
docker build -t bairen-backend .
docker run --rm -p 5000:5000 \
## TESTING NOTES (Expanded Deployment Checklist)

Core Platform
[ ] Servidor escucha en 0.0.0.0:${PORT} (fallback 5000)
[ ] Dockerfile con EXPOSE 5000 y HEALTHCHECK a /health
[ ] Gunicorn con --timeout 60

Health / Observabilidad
[ ] /health y /health/ devuelven 200 sin redirección (texto plano por Nginx; JSON si no interviene Nginx)
[ ] /db/health responde 200 {"db":"ok"}

Routing Restaurado
[ ] /users/login/ devuelve 200 y retorna par de tokens (access/refresh) JSON
[ ] /api/users/ lista usuarios (según permisos)
[ ] /api/properties/ responde 200
[ ] /api/bookings/ (via /api/ router) responde 200
[ ] /admin/ carga login de Django Admin con assets estáticos
[ ] / (home) responde 200 JSON

CORS / CSRF / Seguridad
[ ] CORS permitido solo para:
	- https://www.bairengroup.com
	- https://admin.bairen.group
	- https://app.bairen.group
[ ] Origen distinto (p.ej. https://evil.example) bloqueado con 403/blocked CORS
[ ] CSRF_TRUSTED_ORIGINS contiene los mismos dominios relevantes (para futuros POST con cookies)
[ ] SECURE_SSL_REDIRECT activo (excepto health)
[ ] HSTS encabezado presente

Uploads / Nginx
[ ] Subida archivo ~10MB OK (sin 413)
[ ] Subida archivo ~49MB OK
[ ] Subida archivo >50MB retorna 413 (esperado)
[ ] proxy.conf presente en .platform/nginx/conf.d con client_max_body_size 50M

Static & Media
[ ] /static/ sirve archivos (WhiteNoise) con headers de caché
[ ] /media/ recurso existente responde 200

Base de Datos
[ ] Migraciones aplican sin error al iniciar (ver logs)
[ ] Conexión RDS usa SSL (sslmode=require en DATABASE_URL)

Logs
[ ] Gunicorn logs visibles (STDOUT) en EB
[ ] Errores Django (500) aparecen en logs sin stacktrace en respuesta al cliente

Rechazo / Comprobaciones Negativas
[ ] Acceso HTTP plano (no TLS) redirige a HTTPS excepto /health
[ ] CORS preflight OPTIONS de origen no permitido bloqueado

Documentar Resultados
[ ] Marcar cada ítem con OK/FAIL y guardar para auditoría de despliegue

## Smoke test sugerido
```bash
docker build -t bairen-backend .
docker run --rm -p 5000:5000 \
	-e DJANGO_SETTINGS_MODULE=config.settings_prod \
	-e SECRET_KEY='dev-only' \
	-e DATABASE_URL='postgres://user:pass@host:5432/db?sslmode=require' \
	-e PORT=5000 \
	bairen-backend

curl -i http://localhost:5000/health
curl -i http://localhost:5000/health/
curl -i http://localhost:5000/db/health
```

## Notas
- Verificar que el ALB use `/health` o `/health/` (ambos funcionan).
- Rutas de negocio no incluidas en este PR (urls minimalistas centradas en observabilidad).
- Ampliar CORS o reinstaurar rutas API en siguiente PR si corresponde.

### Variables de entorno recomendadas (Elastic Beanstalk)

```
ALLOWED_HOSTS=api.bairengroup.com,.elasticbeanstalk.com,.compute-1.amazonaws.com,localhost,127.0.0.1
### Hostnames / Seguridad
`DJANGO_ALLOWED_HOSTS` (sobrescribe fallback) ejemplo:
```
DJANGO_ALLOWED_HOSTS=api.bairengroup.com,.bairengroup.com,.elasticbeanstalk.com,localhost,127.0.0.1
```
Evitar `*` salvo diagnóstico puntual de healthchecks sin Host; retirar inmediatamente después.
```

Si no se define `ALLOWED_HOSTS`, el fallback incluye:
`localhost`, `127.0.0.1`, `.elasticbeanstalk.com`, `.compute-1.amazonaws.com`, `api.bairengroup.com`.

`USE_X_FORWARDED_HOST=True` y `SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https')` habilitados para que Django entienda el esquema/host detrás del ALB.
