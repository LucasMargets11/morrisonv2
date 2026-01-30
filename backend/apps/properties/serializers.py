import requests
import logging
from urllib.parse import quote
from django.conf import settings
from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFeature, Pricing, Maintenance
from .utils import extract_s3_key, build_derived_url

class PropertyImageSerializer(serializers.ModelSerializer):
    # Protect .image access: avoid calling ImageField.url on missing files
    image = serializers.SerializerMethodField(read_only=True)
    # Allow providing explicit public URL on write; for read we'll ensure a URL is returned (stored or derived)
    url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    # Accept property id on write (FK assignment); keep it write-only so representation matches acceptance
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), write_only=True, required=True)

    class Meta:
        model = PropertyImage
        fields = ['id', 'property', 's3_key', 'url', 'is_primary', 'order', 'created_at', 'image']
        read_only_fields = ['id', 'created_at', 'image']
        extra_kwargs = {
            'is_primary': {'required': False},
            'order': {'required': False},
        }

    def get_image(self, obj):
        try:
            if getattr(obj, 'image') and getattr(obj.image, 'url', None):
                return obj.image.url
        except Exception:
            # Missing file or storage error; ignore and fall back
            pass
        # Prefer explicit public URL if present
        return getattr(obj, 'url', None)

    def to_representation(self, instance):
        """Ensure 'url' is present when serializing by deriving from s3_key if missing."""
        data = super().to_representation(instance)
        if not data.get('url') and data.get('s3_key'):
            import os as _os
            bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '') or _os.environ.get('S3_MEDIA_BUCKET', '')
            if bucket:
                data['url'] = f"https://{bucket}.s3.amazonaws.com/{data['s3_key']}"
        
        # Ensure originalUrl is present
        data['originalUrl'] = data.get('url')

        # Use helper to extract key (from s3_key or url)
        s3_key = extract_s3_key(instance)
        
        # Generate derived URLs
        data['derived480Url'] = build_derived_url(s3_key, 480)
        data['derived768Url'] = build_derived_url(s3_key, 768)

        return data

    def create(self, validated_data):
        """Create PropertyImage; if url not provided but s3_key present, compute default public URL."""
        import os as _os
        s3_key = validated_data.get('s3_key')
        url = validated_data.get('url')
        if s3_key and not url:
            bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '') or _os.environ.get('S3_MEDIA_BUCKET', '')
            if bucket:
                validated_data['url'] = f"https://{bucket}.s3.amazonaws.com/{s3_key}"
        return PropertyImage.objects.create(**validated_data)

class PropertyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFeature
        fields = ['id', 'name']

class PropertyListItemSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'price', 'address', 'city', 'state', 'zip_code',
            'property_type', 'bedrooms', 'bathrooms', 'square_feet',
            'is_featured', 'status', 'cover'
        ]

    def get_cover(self, obj):
        images = list(obj.images.all())
        if not images:
            return None
        
        cover_img = next((img for img in images if img.is_primary), images[0])
        
        url = getattr(cover_img, 'url', None)
        s3_key = cover_img.s3_key

        # Ensure we have a base URL
        if not url and s3_key:
            import os as _os
            bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '') or _os.environ.get('S3_MEDIA_BUCKET', '')
            if bucket:
                url = f"https://{bucket}.s3.amazonaws.com/{s3_key}"
        
        if not url:
            return None

        # Use helper to extract key (from s3_key or url)
        extracted_key = extract_s3_key(cover_img)
        
        # Generate derived URLs
        derived480 = build_derived_url(extracted_key, 480)
        derived768 = build_derived_url(extracted_key, 768)

        # Prioritize derived768 if exists, else derived480, else original
        cover_url = derived768 or derived480 or url

        return {
            'originalUrl': url,
            'derived480Url': derived480, 
            'derived768Url': derived768,
            'coverUrl': cover_url
        }

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    image_keys = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False,
        help_text="S3 keys ya subidas (properties/<uuid>.<ext>)"
    )
    features = PropertyFeatureSerializer(many=True, read_only=True)
    feature_list = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    removed_image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    images_order = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    full_address = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'address', 'city', 'state',
            'zip_code', 'full_address', 'property_type', 'bedrooms', 'bathrooms',
            'square_feet', 'year_built', 'price', 'is_featured',
            'status', 'created_by', 'created_at', 'updated_at',
            'images', 'features', 'feature_list', 'image_keys',
            'latitude', 'longitude', 'removed_image_ids', 'images_order'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_full_address(self, obj):
        parts = [obj.address, obj.city, obj.state, obj.zip_code]
        return ', '.join(filter(None, parts))

    def create(self, validated_data):
        features_data = validated_data.pop('feature_list', None)
        images_data = validated_data.pop('images', None)
        s3_keys = validated_data.pop('image_keys', [])
        # Geocode solo si está activado
        if getattr(settings, 'USE_GEOCODING', True):
            try:
                # Construye dirección de forma segura (coerción a str y manejo de faltantes)
                addr = str(validated_data.get('address', '') or '')
                city = str(validated_data.get('city', '') or '')
                state = str(validated_data.get('state', '') or '')
                zipc = str(validated_data.get('zip_code', '') or '')
                parts = [p for p in [addr, city, state, zipc] if p]
                full_address = ', '.join(parts) + ', Argentina'
                if full_address.strip(', ').strip():
                    encoded = quote(full_address)
                    api_key = settings.GOOGLE_MAPS_API_KEY
                    url = (
                        'https://maps.googleapis.com/maps/api/geocode/json'
                        f'?address={encoded}&components=country:AR&region=ar&language=es&key={api_key}'
                    )
                    resp = requests.get(url, timeout=6)
                    data = resp.json() if resp.ok else {}
                    if data.get('status') == 'OK' and data.get('results'):
                        loc = data['results'][0]['geometry']['location']
                        validated_data['latitude'] = loc.get('lat')
                        validated_data['longitude'] = loc.get('lng')
            except Exception as e:
                logging.getLogger(__name__).exception("[properties.create] Geocoding failed: %s", e)
        else:
            # Puedes poner coordenadas dummy o dejar en None
            validated_data['latitude'] = None
            validated_data['longitude'] = None

        instance = super().create(validated_data)
        if features_data is not None:
            for feature in features_data:
                PropertyFeature.objects.create(property=instance, name=feature)
        if images_data is not None:
            for idx, img_data in enumerate(images_data):
                PropertyImage.objects.create(
                    property=instance,
                    image=img_data['image'],
                    is_primary=img_data.get('is_primary', False),
                    order=img_data.get('order', idx)
                )
        if s3_keys:
            bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
            domain = f"https://{bucket}.s3.amazonaws.com" if bucket else None
            PropertyImage.objects.bulk_create([
                PropertyImage(property=instance, s3_key=k, url=(f"{domain}/{k}" if domain else "")) for k in s3_keys
            ])
        return instance

    def update(self, instance, validated_data):
        # Campos extra para manejo manual
        removed_ids = validated_data.pop('removed_image_ids', [])
        images_order = validated_data.pop('images_order', [])
        # images_data será None si el campo es read_only, pero lo dejamos por si acaso
        _ = validated_data.pop('images', None)

        # Geocode solo si está activado y si cambió la dirección
        if getattr(settings, 'USE_GEOCODING', True) and any(
            field in validated_data for field in ('address', 'city', 'state', 'zip_code')
        ):
            try:
                addr = str(validated_data.get('address', instance.address) or '')
                city = str(validated_data.get('city', instance.city) or '')
                state = str(validated_data.get('state', instance.state) or '')
                zipc = str(validated_data.get('zip_code', instance.zip_code) or '')
                parts = [p for p in [addr, city, state, zipc] if p]
                full_address = ', '.join(parts) + ', Argentina'
                if full_address.strip(', ').strip():
                    encoded = quote(full_address)
                    api_key = settings.GOOGLE_MAPS_API_KEY
                    url = (
                        'https://maps.googleapis.com/maps/api/geocode/json'
                        f'?address={encoded}&components=country:AR&region=ar&language=es&key={api_key}'
                    )
                    resp = requests.get(url, timeout=6)
                    data = resp.json() if resp.ok else {}
                    if data.get('status') == 'OK' and data.get('results'):
                        loc = data['results'][0]['geometry']['location']
                        validated_data['latitude'] = loc.get('lat')
                        validated_data['longitude'] = loc.get('lng')
            except Exception as e:
                logging.getLogger(__name__).exception("[properties.update] Geocoding failed: %s", e)

        instance = super().update(instance, validated_data)

        # 1. Eliminar imágenes solicitadas
        if removed_ids:
            # Filtramos para asegurar que pertenecen a esta propiedad
            PropertyImage.objects.filter(property=instance, id__in=removed_ids).delete()

        # 2. Reordenar y marcar primaria
        if images_order:
            # images_order es una lista de IDs [id1, id2, id3]
            # Validamos que los IDs existan y sean de esta property
            valid_images = {
                img.id: img 
                for img in PropertyImage.objects.filter(property=instance, id__in=images_order)
            }
            
            # Recorremos el orden enviado
            for idx, img_id in enumerate(images_order):
                if img_id in valid_images:
                    img = valid_images[img_id]
                    img.order = idx
                    img.is_primary = (idx == 0) # El primero es principal
                    img.save(update_fields=['order', 'is_primary'])
            
            # Asegurar que si quedan imágenes fuera del orden (ej: recién subidas y no incluidas en order), no queden "rotas"
            # (Opcional: ponerlas al final)

        return instance

class PricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pricing
        fields = '__all__'

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'
