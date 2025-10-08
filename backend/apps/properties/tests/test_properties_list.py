from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.properties.models import Property, PropertyImage

User = get_user_model()


def test_properties_list_returns_images(db):
    client = APIClient()
    user = User.objects.create_user(username='u', password='p')
    p = Property.objects.create(
        title='t', description='d', address='a', city='c', state='s', zip_code='z',
        property_type='temporal', bedrooms=1, bathrooms=1, square_feet=10, price=10,
        created_by=user,
    )
    PropertyImage.objects.create(property=p, s3_key='properties/1/foto.jpg', url='https://bucket.s3.amazonaws.com/properties/1/foto.jpg', is_primary=True, order=0)

    resp = client.get('/api/properties/')
    assert resp.status_code == 200
    data = resp.json()
    results = data.get('results') if isinstance(data, dict) else data
    assert isinstance(results, list)
    assert len(results) >= 1
    first = results[0]
    assert 'images' in first
    assert isinstance(first['images'], list)
