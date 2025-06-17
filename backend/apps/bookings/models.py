from django.db import models
from django.contrib.auth import get_user_model
from apps.properties.models import Property

User = get_user_model()

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('blocked', 'Blocked'),  # Agregado el estado 'blocked'
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='bookings')
    guest = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    guest_count = models.IntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    special_requests = models.TextField(blank=True, null=True)
    reason = models.CharField(max_length=255, blank=True, null=True)  # Nuevo campo 'reason'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} - {self.property.title}"