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
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        start = self.request.query_params.get('start')  # (reservado para futura lógica de disponibilidad)
        end = self.request.query_params.get('end')      # (reservado)
        adults = self.request.query_params.get('adults')
        children = self.request.query_params.get('children')  # (no usado aún)
        babies = self.request.query_params.get('babies')      # (no usado aún)
        property_type = self.request.query_params.get('propertyType') or self.request.query_params.get('property_type')

        # Filtro de búsqueda básica
        if search:
            queryset = queryset.filter(
                Q(city__icontains=search) |
                Q(address__icontains=search)
            )
        # Filtro por cantidad mínima de dormitorios (usando 'adults' como aproximación)
        if adults:
            try:
                queryset = queryset.filter(bedrooms__gte=int(adults))
            except ValueError:
                pass
        # Filtro por tipo de propiedad (temporal, vacacional, tradicional, etc.)
        if property_type and property_type != 'all':
            queryset = queryset.filter(property_type=property_type)

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