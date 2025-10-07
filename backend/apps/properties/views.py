from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Property, PropertyImage, Pricing, Maintenance
from .serializers import PropertySerializer, PropertyImageSerializer, PricingSerializer, MaintenanceSerializer
from .permissions import IsOwnerOrAdmin
from django.contrib import admin
from rest_framework.views import APIView
from django.conf import settings
import uuid, mimetypes
import boto3


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('created_by').prefetch_related('images')
    serializer_class = PropertySerializer
    permission_classes = [AllowAny]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        # Public read; authenticated for create and media mutations
        if getattr(self, 'action', None) in ['create', 'upload_images', 'delete_image']:
            return [IsAuthenticated()]
        return [AllowAny()]

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

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import logging, traceback
            logging.getLogger(__name__).exception("[properties.list] Unhandled error: %s", e)
            return Response({"detail": "Server error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Exception as e:
            import logging, traceback
            logging.getLogger(__name__).exception("[properties.retrieve] Unhandled error: %s", e)
            return Response({"detail": "Server error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def presign_property_images(request):
    """
    Body: { "files": [ {"name":"foto1.jpg","type":"image/jpeg"}, ... ] }
    """
    s3 = boto3.client('s3', region_name=settings.AWS_S3_REGION_NAME)
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    out = []
    for f in request.data.get('files', []):
        ext = (f.get("name") or "").split(".")[-1].lower() or "jpg"
        key = f"properties/{uuid.uuid4()}.{ext}"
        content_type = f.get("type") or mimetypes.guess_type(f.get("name"))[0] or "application/octet-stream"
        url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': bucket,
                'Key': key,
                'ContentType': content_type,
                'ACL': 'public-read',
            },
            ExpiresIn=300,
        )
        out.append({"key": key, "uploadUrl": url, "contentType": content_type})
    return Response({"uploads": out})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attach_property_images(request, pk):
    """
    Body: { "keys": ["properties/uuid1.jpg", ...] }
    """
    from django.shortcuts import get_object_or_404
    prop = get_object_or_404(Property, pk=pk, created_by=request.user)
    keys = request.data.get("keys", [])
    domain = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
    imgs = [PropertyImage(property=prop, s3_key=k, url=f"{domain}/{k}") for k in keys]
    PropertyImage.objects.bulk_create(imgs)
    return Response({"added": len(imgs)}, status=status.HTTP_201_CREATED)


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