# apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserViewSet, CustomTokenObtainPairView, UserRoleView  # si usas tu propia vista para login

router = DefaultRouter()
router.register('', UserViewSet, basename='user')

urlpatterns = [
    # coinciden con "/users/login/" y "/users/refresh/"
    path('login/',  CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # otros endpoints de usuario (e.g. registro, role, profile…)
    path('role/', UserRoleView.as_view(), name='user-role'),
    path('', include(router.urls)),
    
]
