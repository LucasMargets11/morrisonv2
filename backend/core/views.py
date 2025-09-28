from django.http import JsonResponse
from django.db import connection

def health(_request):
    return JsonResponse({"app": "ok"})

def db_health(_request):
    try:
        with connection.cursor() as cur:
            cur.execute("SELECT 1;")
        return JsonResponse({"db": "ok"})
    except Exception as exc:
        return JsonResponse({"db": "error", "detail": str(exc)}, status=500)
