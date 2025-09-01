from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlockViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'blocks', BlockViewSet, basename='block')

urlpatterns = [
    path('', include(router.urls)),
]