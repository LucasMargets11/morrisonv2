import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', 'AIzaSyAhKUEMZevObTmkKtml47NvHQFkDKyZt7o')
USE_GEOCODING = os.environ.get('USE_GEOCODING', 'true').lower() == 'true'

DEBUG = os.getenv('DJANGO_DEBUG', os.getenv('DEBUG', 'false')).lower() == 'true'

# ALLOWED_HOSTS: configurable vía DJANGO_ALLOWED_HOSTS (coma separada). Ej:
# DJANGO_ALLOWED_HOSTS="api.bairengroup.com,.bairengroup.com,.elasticbeanstalk.com,localhost,127.0.0.1"
# Uso temporal de "*" sólo si el ALB hace health check sin Host correcto (no recomendable a largo plazo).
# Prefer DJANGO_ALLOWED_HOSTS but support legacy ALLOWED_HOSTS for compatibility
_hosts_env = os.getenv("DJANGO_ALLOWED_HOSTS") or os.getenv("ALLOWED_HOSTS") or ""
ALLOWED_HOSTS = [h.strip() for h in _hosts_env.split(",") if h.strip()] or [
    "api.bairengroup.com",
    "admin.bairengroup.com",            # your domain
    ".elasticbeanstalk.com",          # EB URLs
    "localhost", "127.0.0.1",         # container healthcheck
]
    
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'apps.users',
    'apps.properties',
    'apps.bookings',
    'storages',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# === STATIC & MEDIA ===
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.getenv('DJANGO_MEDIA_ROOT', '/app/media')

# --- AWS S3 MEDIA (opcional: activado si se define AWS_STORAGE_BUCKET_NAME) ---
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
if AWS_STORAGE_BUCKET_NAME:
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_S3_SIGNATURE_VERSION = os.getenv('AWS_S3_SIGNATURE_VERSION', 's3v4')
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None  # el backend controla ACL
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "public, max-age=31536000"}
    DEFAULT_FILE_STORAGE = 'core.storage_backends.PublicMediaS3Storage'
    # Dominio público (sin CloudFront aún). Cambiar a CDN si se agrega.
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# Lista explícita desde ENV (separadas por coma, con esquema http/https)
_raw = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]

# (Opcional) Regex para permitir subdominios (útil p/ *.bairen.group)
_rx = os.getenv("CORS_ALLOWED_ORIGIN_REGEXES", "")
CORS_ALLOWED_ORIGIN_REGEXES = [(p.strip()) for p in _rx.split(",") if p.strip()]

# Cookies/sesiones cross-site (solo si usás auth por cookie)
CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "false").lower() == "true"

# --- CSRF (necesario si hay formularios/cookies desde otro origen) ---
_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "")
CSRF_TRUSTED_ORIGINS = [u.strip() for u in _csrf.split(",") if u.strip()]

# Exempt health endpoints from HTTPS redirect (used by ALB health checks before TLS termination)
SECURE_REDIRECT_EXEMPT = [r"^health/?$"]

# Proxy support (so Django builds absolute URLs correctly behind ELB/ALB)

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True