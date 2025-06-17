from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFeature, Pricing, Maintenance

class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_primary', 'created_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

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

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'address', 'city', 'state',
            'zip_code', 'property_type', 'bedrooms', 'bathrooms',
            'square_feet', 'year_built', 'price', 'is_featured',
            'status', 'created_by', 'created_at', 'updated_at',
            'images', 'features', 'feature_list'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        features_data = validated_data.pop('feature_list', [])
        property = Property.objects.create(**validated_data)
        
        for feature in features_data:
            PropertyFeature.objects.create(property=property, name=feature)
        
        return property

    def update(self, instance, validated_data):
        features_data = validated_data.pop('feature_list', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if features_data is not None:
            instance.features.all().delete()
            for feature in features_data:
                PropertyFeature.objects.create(property=instance, name=feature)

        return instance

class PricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pricing
        fields = '__all__'

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'