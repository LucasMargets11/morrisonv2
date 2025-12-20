import os
import boto3
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.properties.models import PropertyImage
from botocore.exceptions import ClientError

class Command(BaseCommand):
    help = 'Backfill old property images to new S3 structure to trigger Lambda thumbnails'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', default=False, help='Dry run mode (default if not commit)')
        parser.add_argument('--commit', action='store_true', help='Commit changes to DB and S3')
        parser.add_argument('--limit', type=int, help='Limit number of images to process')
        parser.add_argument('--only-missing', action='store_true', help='Skip copy if destination exists')

    def handle(self, *args, **options):
        commit = options['commit']
        # If commit is False, dry_run is True. If commit is True, dry_run is False (unless explicitly set, but logic below handles it)
        # Actually, usually --dry-run is a flag. If present, it's True.
        # User said: "--dry-run (por defecto true si no está --commit)"
        # So if --commit is NOT present, force dry_run = True.
        # If --commit IS present, dry_run is False unless --dry-run is also passed (which would be weird but safe).
        
        if not commit:
            dry_run = True
        else:
            dry_run = options['dry_run'] # If user passes both --commit and --dry-run, respect dry-run flag? Or just assume commit overrides?
            # Let's stick to: if not commit, then dry_run.
        
        limit = options['limit']
        only_missing = options['only_missing']

        self.stdout.write(f"Starting backfill. Dry run: {dry_run}, Commit: {commit}")

        # Filter images that don't match the new prefix
        qs = PropertyImage.objects.exclude(s3_key__startswith='properties/original/')
        
        if limit:
            qs = qs[:limit]
            
        total = qs.count()
        self.stdout.write(f"Found {total} images to process")

        s3 = boto3.client('s3', region_name='us-east-1')
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        processed_count = 0
        success_count = 0
        error_count = 0

        for img in qs:
            processed_count += 1
            
            # Determine old key
            old_key = img.s3_key
            if not old_key:
                # Fallback to image field if s3_key is empty
                # For ImageField, .name usually contains the path relative to storage root
                old_key = img.image.name
            
            if not old_key:
                self.stdout.write(self.style.WARNING(f"[{processed_count}/{total}] Image {img.id} has no s3_key or image file. Skipping."))
                continue

            # Determine new key
            # "properties/original/<property_id>/<image_id>-<basename_original>"
            basename = os.path.basename(old_key)
            new_key = f"properties/original/{img.property_id}/{img.id}-{basename}"

            self.stdout.write(f"[{processed_count}/{total}] Processing ID {img.id}: {old_key} -> {new_key}")

            if dry_run:
                self.stdout.write(self.style.SUCCESS(f"  [DRY-RUN] Would copy {old_key} to {new_key} and update DB"))
                continue

            try:
                # Check if destination exists if requested
                should_copy = True
                if only_missing:
                    try:
                        s3.head_object(Bucket=bucket_name, Key=new_key)
                        self.stdout.write(f"  Destination {new_key} already exists. Skipping copy.")
                        should_copy = False
                    except ClientError as e:
                        if e.response['Error']['Code'] == "404":
                            should_copy = True
                        else:
                            raise

                if should_copy:
                    self.stdout.write(f"  Copying S3 object...")
                    s3.copy_object(
                        Bucket=bucket_name,
                        CopySource={'Bucket': bucket_name, 'Key': old_key},
                        Key=new_key,
                        MetadataDirective='COPY'
                    )
                
                # Update DB
                img.s3_key = new_key
                
                # Update URL if it exists and looks like it contains the old key
                if img.url and old_key in img.url:
                    img.url = img.url.replace(old_key, new_key)
                
                img.save()
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Success"))

            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f"  Error processing image {img.id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Finished. Processed: {processed_count}, Success: {success_count}, Errors: {error_count}"))
