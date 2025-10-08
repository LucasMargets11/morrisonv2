from rest_framework import viewsets, status, parsers, serializers
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
import logging


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('created_by').prefetch_related('images')
    serializer_class = PropertySerializer
    permission_classes = [AllowAny]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        # Public read; authenticated for create and media mutations
        if getattr(self, 'action', None) in ['create', 'upload_images', 'delete_image', 'images']:
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
        try:
            serializer.save(created_by=self.request.user)
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception("[properties.create] Unhandled error on create: %s", e)
            raise

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except serializers.ValidationError as ve:  # type: ignore
            # Return structured 400 instead of HTML 500
            return Response(getattr(ve, 'detail', {'detail': 'Invalid input'}), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception("[properties.create] Unhandled exception: %s", e)
            return Response({"detail": "Server error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    @action(detail=True, methods=['post'], url_path='images')
    def images(self, request, pk=None):
        """
        Body: { "s3_key": "properties/<id>/foto-<uuid>.jpg", "is_primary": true, "order": 0 }
        Registers an already uploaded S3 object as a PropertyImage.
        """
        prop = self.get_object()
        user = request.user
        if not (user.is_authenticated and (user == prop.created_by or user.is_staff or user.is_superuser)):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        s3_key = request.data.get('s3_key')
        if not s3_key or not isinstance(s3_key, str):
            return Response({"s3_key": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        is_primary = bool(request.data.get('is_primary', False))
        try:
            order = int(request.data.get('order', 0))
        except Exception:
            order = 0

        bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '')
        domain = f"https://{bucket}.s3.amazonaws.com" if bucket else ''
        try:
            img = PropertyImage.objects.create(
                property=prop,
                s3_key=s3_key,
                url=f"{domain}/{s3_key}" if domain else '',
                is_primary=is_primary,
                order=order,
            )
            return Response(PropertyImageSerializer(img).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logging.getLogger(__name__).exception("[properties.images] Failed to register image", extra={"property_id": prop.id, "s3_key": s3_key})
            return Response({"detail": "Failed to register image", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
def presign_upload(request):
    """
    POST /api/uploads/presign/
    Body: { "property_id": 123, "filename": "foto.jpg", "content_type": "image/jpeg" }
    Returns: { upload_url, s3_key, headers }
    """
    try:
        prop_id = request.data.get('property_id')
        filename = (request.data.get('filename') or '').strip()
        content_type = (request.data.get('content_type') or '').strip()

        # Validate inputs
        try:
            prop = Property.objects.get(pk=prop_id)
        except Property.DoesNotExist:
            return Response({"property_id": ["Invalid property."]}, status=status.HTTP_400_BAD_REQUEST)

        if content_type not in ("image/jpeg", "image/png", "image/webp"):
            return Response({"content_type": ["Unsupported type. Use image/jpeg, image/png or image/webp."]}, status=status.HTTP_400_BAD_REQUEST)

        # Build S3 key: properties/<property_id>/foto-<uuid>.<ext>
        ext = (filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg').lower()
        if ext not in ("jpg", "jpeg", "png", "webp"):
            # Normalize extension to match content_type
            ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[content_type]
        s3_key = f"properties/{prop.id}/foto-{uuid.uuid4()}.{ext}"

        s3 = boto3.client('s3', region_name=settings.AWS_S3_REGION_NAME)
        params = {
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': s3_key,
            'ContentType': content_type,
            # No ACL here if bucket policy handles public access
        }
        upload_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params=params,
            ExpiresIn=300,
        )

        headers = {
            'Content-Type': content_type,
            'Cache-Control': 'public, max-age=31536000, immutable',
        }
        return Response({
            'upload_url': upload_url,
            's3_key': s3_key,
            'headers': headers,
        })
    except Exception as e:
        logging.getLogger(__name__).exception("[uploads.presign] Failed to presign", extra={
            "property_id": request.data.get('property_id'),
            "filename": request.data.get('filename'),
        })
        return Response({"detail": "Failed to presign upload", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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