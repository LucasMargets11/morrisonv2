import os
from django.conf import settings

def extract_s3_key(image_obj):
    """
    Extracts the S3 key from a PropertyImage object.
    Prioritizes image_obj.s3_key.
    If missing, tries to parse it from image_obj.url.
    """
    # 1. Try s3_key
    s3_key = getattr(image_obj, 's3_key', None)
    if s3_key:
        return s3_key
    
    # 2. Try parsing url
    url = getattr(image_obj, 'url', None)
    if url:
        # Expected format: https://<bucket>.s3.amazonaws.com/<KEY>
        # We can just split by amazonaws.com/
        if 'amazonaws.com/' in url:
            return url.split('amazonaws.com/', 1)[1]
            
    return None

def build_derived_url(s3_key, size):
    """
    Constructs a derived WebP URL for a given S3 key and size (480 or 768).
    Input key expected: properties/original/<property_id>/<filename>.<ext>
    Output key: properties/derived/<size>/<property_id>/<filename>.webp
    """
    if not s3_key or 'properties/original/' not in s3_key:
        return None
        
    try:
        # Extract relative path: properties/original/123/abc.jpg -> 123/abc.jpg
        relative_path = s3_key.split('properties/original/', 1)[1]
        # Remove extension: 123/abc.jpg -> 123/abc
        base_name = relative_path.rsplit('.', 1)[0]
        
        bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '') or os.environ.get('S3_MEDIA_BUCKET', '')
        if bucket:
            base_url = f"https://{bucket}.s3.amazonaws.com/properties/derived"
            return f"{base_url}/{size}/{base_name}.webp"
    except IndexError:
        pass
        
    return None
