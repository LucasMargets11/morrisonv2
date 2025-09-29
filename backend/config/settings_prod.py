import os
import dj_database_url
from .settings import *  # noqa

DEBUG = False

# Seguridad
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Evitar 301/302 en health (HTTP / HTTPS)
SECURE_REDIRECT_EXEMPT = [r"^health/?$"]

# Hosts (public + API). Admin subdomain no longer exposed directly; ALB/EB internal host kept optional if needed.
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else [
    "api.bairengroup.com",
    "admin.bairengroup.com",            # your domain
    ".elasticbeanstalk.com",          # EB URLs
    "localhost", "127.0.0.1",         # container healthcheck
]

CSRF_TRUSTED_ORIGINS = [
    "https://bairengroup.com",
    "https://www.bairengroup.com",
    "https://admin.bairen.group",
    "https://api.bairengroup.com",
    "https://app.bairen.group",
]

# Proxy/ALB
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# DB (RDS) con SSL y keep-alive razonable
DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        conn_max_age=60,
        ssl_require=True,
    )
}

# Apps requeridas
INSTALLED_APPS = list(INSTALLED_APPS)
for app in ["corsheaders", "rest_framework"]:
    if app not in INSTALLED_APPS:
        INSTALLED_APPS.append(app)

# Middlewares (orden: Security -> WhiteNoise -> HealthNoSSLRedirect -> CORS -> resto)
MIDDLEWARE = list(MIDDLEWARE)
if "django.middleware.security.SecurityMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(0, "django.middleware.security.SecurityMiddleware")
if "whitenoise.middleware.WhiteNoiseMiddleware" not in MIDDLEWARE:
    sec_idx = MIDDLEWARE.index("django.middleware.security.SecurityMiddleware")
    MIDDLEWARE.insert(sec_idx + 1, "whitenoise.middleware.WhiteNoiseMiddleware")
wn_idx = MIDDLEWARE.index("whitenoise.middleware.WhiteNoiseMiddleware")
if "core.middleware.HealthNoSSLRedirectMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(wn_idx + 1, "core.middleware.HealthNoSSLRedirectMiddleware")
if "corsheaders.middleware.CorsMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(wn_idx + 2, "corsheaders.middleware.CorsMiddleware")

# Static
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# CORS (frontends permitidos). Para modificar sin cambiar código, usar env var:
# CORS_ALLOWED_ORIGINS="https://www.bairengroup.com,https://bairengroup.com"
_cors_env = os.getenv("CORS_ALLOWED_ORIGINS")
if _cors_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        "https://www.bairengroup.com",
        "https://bairengroup.com",
        "https://admin.bairen.group",
        "https://app.bairen.group",
    ]
CORS_ALLOW_CREDENTIALS = True
