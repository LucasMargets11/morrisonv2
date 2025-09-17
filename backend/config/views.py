from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Bienvenido a la API de Grupo Bairen"})


def health(request):
    return JsonResponse({"status": "ok"})