from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        extra_kwargs = {'guest': {'required': False, 'allow_null': True}}

    def validate(self, data):
        # Check if the dates are valid
        if data['check_in_date'] >= data['check_out_date']:
            raise serializers.ValidationError({
                'check_out_date': 'Check-out date must be after check-in date'
            })

        # Check if the property is available for these dates
        property = data['property']
        overlapping_bookings = Booking.objects.filter(
            property=property,
            status__in=['pending', 'confirmed'],
            check_in_date__lt=data['check_out_date'],
            check_out_date__gt=data['check_in_date']
        ).exclude(id=self.instance.id if self.instance else None)

        if overlapping_bookings.exists():
            raise serializers.ValidationError({
                'non_field_errors': ['Property is not available for these dates']
            })

        return data

    def create(self, validated_data):
        validated_data['guest'] = self.context['request'].user
        return super().create(validated_data)