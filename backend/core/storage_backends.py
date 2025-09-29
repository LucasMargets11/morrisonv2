from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class PublicMediaS3Storage(S3Boto3Storage):
    """S3 storage for public media files.

    Uses bucket ACL/object ACL public-read (served directly via S3 URL).
    No overwrite to preserve original uploads; allows version-like behavior by changing filename.
    """
    default_acl = 'public-read'
    file_overwrite = False
    custom_domain = f"{getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '')}.s3.amazonaws.com"

    def url(self, name, parameters=None, expire=None, http_method=None):  # type: ignore[override]
        # Ensure we return a clean HTTPS URL without query params (public objects)
        base = super().url(name, parameters=parameters, expire=expire, http_method=http_method)
        # boto may return with params if signing forced; keep simplest form
        if '?' in base:
            base = base.split('?', 1)[0]
        return base