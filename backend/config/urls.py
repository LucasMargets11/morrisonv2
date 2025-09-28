from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from core.views import health, db_health
from .views import home

urlpatterns = [
    # Home / root
    path("", home, name="home"),

    # Health & DB health
    path("health", health, name="health"),
    path("health/", health, name="health-slash"),
    path("db/health", db_health, name="db-health"),
    path("db/health/", db_health, name="db-health-slash"),

    # Admin
    path("admin/", admin.site.urls),

    # Users top-level (e.g. /users/login/ )
    path("users/", include("apps.users.urls")),

    # Versionless API grouping
    path("api/users/", include("apps.users.urls")),
    path("api/properties/", include("apps.properties.urls")),
    path("api/", include("apps.bookings.urls")),
]

# Serve media in this deployment variant (EB single container). For production behind a CDN/S3
# you would offload this. Safe because DEBUG False means collectstatic assets served by WhiteNoise;
# media still needs explicit mapping unless using external storage.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)