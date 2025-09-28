from django.conf import settings
from django.http import HttpResponse, HttpResponsePermanentRedirect

class HealthNoSSLRedirectMiddleware:
    """
    Evita que /health y /health/ terminen en 301/302 cuando SECURE_SSL_REDIRECT=True.
    Debe ubicarse después de WhiteNoise y antes del resto de middlewares de vista.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.exempt_paths = {"/health", "/health/"}

    def __call__(self, request):
        response = self.get_response(request)
        if (
            isinstance(response, HttpResponsePermanentRedirect)
            and request.path in self.exempt_paths
            and getattr(settings, "SECURE_SSL_REDIRECT", False)
        ):
            return HttpResponse("ok", content_type="text/plain", status=200)
        return response
