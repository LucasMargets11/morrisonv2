from django.http import JsonResponse, HttpResponse

def home(request):
    return JsonResponse({"message": "Bienvenido a la API de Grupo Bairen"})


def health(_request):
    # Plain text response used if Nginx layer is not intercepting /health
    return JsonResponse({"ok": True})