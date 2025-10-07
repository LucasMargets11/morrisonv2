from django.contrib import admin
from .models import Property, PropertyImage

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0
    readonly_fields = ('url',)

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('id','title','city','price','property_type','created_by','created_at')
    inlines = [PropertyImageInline]
