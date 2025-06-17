from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet,  PropertyPricingView, PropertyMaintenanceView

router = DefaultRouter()
router.register('', PropertyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('<int:property_id>/pricing/', PropertyPricingView.as_view(), name='property-pricing'),
    path('<int:property_id>/maintenance/', PropertyMaintenanceView.as_view(), name='property-maintenance'),
]