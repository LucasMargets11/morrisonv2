from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Property(models.Model):
    PROPERTY_TYPES = [
        ('house', 'House'),
        ('apartment', 'Apartment'),
        ('condo', 'Condo'),
        ('townhouse', 'Townhouse'),
        ('land', 'Land'),
    ('temporal', 'Temporal'),
    ('vacacional', 'Vacacional'),
    ('tradicional', 'Tradicional'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    bedrooms = models.IntegerField()
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1)
    square_feet = models.IntegerField()
    year_built = models.IntegerField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='properties/')
    # New fields for direct-to-S3 uploads (compat with existing 'image')
    s3_key = models.CharField(max_length=512, blank=True, default='')
    url = models.URLField(max_length=1024, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)  # <-- agrega esto
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order','-is_primary', 'id']  # <-- así siempre respeta el orden

class PropertyFeature(models.Model):
    property = models.ForeignKey(Property, related_name='features', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ['property', 'name']

class Pricing(models.Model):
    property = models.ForeignKey('Property', related_name='pricings', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.property.title} - {self.start_date} to {self.end_date}: {self.price}"

class Maintenance(models.Model):
    property = models.ForeignKey('Property', related_name='maintenances', on_delete=models.CASCADE)
    date = models.DateField()
    description = models.CharField(max_length=255)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.property.title} - {self.date}: {self.description}"