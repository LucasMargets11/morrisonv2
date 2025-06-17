from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Property, PropertyImage, Pricing, Maintenance
from .serializers import PropertySerializer, PropertyImageSerializer, PricingSerializer, MaintenanceSerializer
from .permissions import IsOwnerOrAdmin
from django.contrib import admin
from rest_framework.views import APIView


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [AllowAny]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        queryset = Property.objects.all()
        user = self.request.user

        # Si es admin, ve todo
        if user.is_authenticated and user.is_staff:
            pass  # queryset = Property.objects.all() ya lo trae todo
        elif user.is_authenticated:
            queryset = queryset.filter(Q(status='published') | Q(created_by=user))
        else:
            queryset = queryset.filter(status='published')

        # Filtros por query params
        property_type = self.request.query_params.get('type')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        bedrooms = self.request.query_params.get('bedrooms')
        city = self.request.query_params.get('city')

        if property_type:
            queryset = queryset.filter(property_type=property_type)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if bedrooms:
            queryset = queryset.filter(bedrooms__gte=bedrooms)
        if city:
            queryset = queryset.filter(city__icontains=city)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        property = self.get_object()
        files = request.FILES.getlist('images')
        
        if not files:
            return Response(
                {'error': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        images = []
        for file in files:
            image = PropertyImage.objects.create(
                property=property,
                image=file,
                is_primary=len(images) == 0
            )
            images.append(image)

        serializer = PropertyImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        property = self.get_object()
        image_id = request.data.get('image_id')
        
        try:
            image = property.images.get(id=image_id)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PropertyImage.DoesNotExist:
            return Response(
                {'error': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PropertyPricingView(APIView):
    def get(self, request, property_id):
        pricings = Pricing.objects.filter(property_id=property_id)
        serializer = PricingSerializer(pricings, many=True)
        return Response(serializer.data)

    def post(self, request, property_id):
        data = request.data.copy()
        data['property'] = property_id
        serializer = PricingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PropertyMaintenanceView(APIView):
    def get(self, request, property_id):
        maintenances = Maintenance.objects.filter(property_id=property_id)
        serializer = MaintenanceSerializer(maintenances, many=True)
        return Response(serializer.data)