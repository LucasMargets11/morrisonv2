import os
from .settings import *  # noqa

# Production overrides for AWS deployment

DEBUG = False

# Security hardening
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "true").lower() == "true"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# CORS/CSRF
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if os.getenv("CORS_ALLOWED_ORIGINS") else []
CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if os.getenv("CSRF_TRUSTED_ORIGINS") else []

# Respect X-Forwarded-Proto when behind ALB/ELB terminating TLS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Use S3 for static and media via django-storages
INSTALLED_APPS = list(INSTALLED_APPS) + ["storages"]

AWS_STORAGE_BUCKET_NAME = os.environ["AWS_STORAGE_BUCKET_NAME"]
AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "us-east-1")
AWS_S3_SIGNATURE_VERSION = os.getenv("AWS_S3_SIGNATURE_VERSION", "s3v4")
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}

# Optional: custom domain (e.g., CloudFront) for media/static
AWS_S3_CUSTOM_DOMAIN = os.getenv("AWS_S3_CUSTOM_DOMAIN", None)

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        # Store uploads under "media/" prefix to separate from static
        "OPTIONS": {"location": os.getenv("AWS_MEDIA_LOCATION", "media")},
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3boto3.S3StaticStorage",
        "OPTIONS": {"location": os.getenv("AWS_STATIC_LOCATION", "static")},
    },
}

if AWS_S3_CUSTOM_DOMAIN:
    STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/{os.getenv('AWS_STATIC_LOCATION', 'static')}/"
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/{os.getenv('AWS_MEDIA_LOCATION', 'media')}/"
else:
    STATIC_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com/{os.getenv('AWS_STATIC_LOCATION', 'static')}/"
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com/{os.getenv('AWS_MEDIA_LOCATION', 'media')}/"

# Logging suitable for CloudWatch
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        }
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": os.getenv("DJANGO_LOG_LEVEL", "INFO")},
        "gunicorn.error": {"handlers": ["console"], "level": "INFO"},
        "gunicorn.access": {"handlers": ["console"], "level": "INFO"},
    },
}
