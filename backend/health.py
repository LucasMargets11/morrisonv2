from django.http import JsonResponse


def health(_request):  # Simple health endpoint (no DB touch)
    return JsonResponse({"status": "ok"})
