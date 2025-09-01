from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer
from apps.properties.permissions import IsOwnerOrAdmin

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_fields = ['property']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(
            Q(guest=user) | Q(property__created_by=user)
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'pending' and booking.status != 'confirmed':
            return Response(
                {'error': 'Cannot cancel booking in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'pending':
            return Response(
                {'error': 'Can only confirm pending bookings'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'confirmed'
        booking.save()
        return Response(BookingSerializer(booking).data)

class BlockViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.filter(status='blocked')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(status='blocked')

    def get_queryset(self):
        qs = super().get_queryset()
        property_id = self.request.query_params.get('property')
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs