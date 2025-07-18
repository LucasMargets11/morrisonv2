import requests
from urllib.parse import quote
from django.conf import settings
from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFeature, Pricing, Maintenance

class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_primary', 'created_at', 'order']

class PropertyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFeature
        fields = ['id', 'name']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    features = PropertyFeatureSerializer(many=True, read_only=True)
    feature_list = serializers.ListField(
        child=serializers.CharField(),
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
            'images', 'features', 'feature_list',
            'latitude', 'longitude'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_full_address(self, obj):
        parts = [obj.address, obj.city, obj.state, obj.zip_code]
        return ', '.join(filter(None, parts))

    def create(self, validated_data):
        features_data = validated_data.pop('feature_list', None)
        images_data = validated_data.pop('images', None)
        # Geocode solo si está activado
        if getattr(settings, 'USE_GEOCODING', True):
            full_address = self.get_full_address(type('O', (), validated_data)) + ', Argentina'
            encoded = quote(full_address)
            api_key = settings.GOOGLE_MAPS_API_KEY
            url = (
                'https://maps.googleapis.com/maps/api/geocode/json'
                f'?address={encoded}&components=country:AR&region=ar&language=es&key={api_key}'
            )
            resp = requests.get(url)
            data = resp.json()
            if data.get('status') == 'OK' and data.get('results'):
                loc = data['results'][0]['geometry']['location']
                validated_data['latitude'] = loc['lat']
                validated_data['longitude'] = loc['lng']
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
        return instance

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)

        # Geocode solo si está activado y si cambió la dirección
        if getattr(settings, 'USE_GEOCODING', True) and any(
            field in validated_data for field in ('address', 'city', 'state', 'zip_code')
        ):
            address_obj = type('O', (), {
                'address': validated_data.get('address', instance.address),
                'city': validated_data.get('city', instance.city),
                'state': validated_data.get('state', instance.state),
                'zip_code': validated_data.get('zip_code', instance.zip_code),
            })
            full_address = self.get_full_address(address_obj) + ', Argentina'
            encoded = quote(full_address)
            api_key = settings.GOOGLE_MAPS_API_KEY
            url = (
                'https://maps.googleapis.com/maps/api/geocode/json'
                f'?address={encoded}&components=country:AR&region=ar&language=es&key={api_key}'
            )
            resp = requests.get(url)
            data = resp.json()
            if data.get('status') == 'OK' and data.get('results'):
                loc = data['results'][0]['geometry']['location']
                validated_data['latitude'] = loc['lat']
                validated_data['longitude'] = loc['lng']

        instance = super().update(instance, validated_data)

        if images_data is not None:
            # 1. Elimina imágenes que ya no están
            keep_ids = [img.get('id') for img in images_data if img.get('id')]
            instance.images.exclude(id__in=keep_ids).delete()

            # 2. Actualiza o crea imágenes
            for idx, img_data in enumerate(images_data):
                img_id = img_data.get('id')
                defaults = {
                    'is_primary': img_data.get('is_primary', False),
                    'order': img_data.get('order', idx),
                    'property': instance,
                }
                if 'image' in img_data:
                    defaults['image'] = img_data['image']

                if img_id:
                    # Actualiza la imagen existente
                    PropertyImage.objects.filter(id=img_id, property=instance).update(**defaults)
                else:
                    # Crea una nueva imagen
                    PropertyImage.objects.create(**defaults)

        return instance

class PricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pricing
        fields = '__all__'

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'
