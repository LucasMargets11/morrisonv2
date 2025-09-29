import os
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.core.files.storage import default_storage


class Command(BaseCommand):
    help = "Upload existing local media files under MEDIA_ROOT to the active S3 storage (if configured)."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='List files without uploading')
        parser.add_argument('--prefix', default='', help='Only migrate files under this relative prefix')

    def handle(self, *args, **options):
        bucket_active = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None) and 's3' in default_storage.__class__.__module__
        if not bucket_active:
            raise CommandError('S3 storage not active (AWS_STORAGE_BUCKET_NAME unset or DEFAULT_FILE_STORAGE not S3).')

        media_root = Path(settings.MEDIA_ROOT)
        if not media_root.exists():
            self.stdout.write(self.style.WARNING(f'MEDIA_ROOT {media_root} does not exist. Nothing to migrate.'))
            return

        prefix = options['prefix'].strip('/')
        dry = options['dry_run']

        base_len = len(str(media_root)) + 1
        count = 0
        uploaded = 0

        for root, _, files in os.walk(media_root):
            for fname in files:
                local_path = Path(root) / fname
                rel = local_path.as_posix()[base_len:]
                if prefix and not rel.startswith(prefix):
                    continue
                count += 1
                if dry:
                    self.stdout.write(f'[dry-run] {rel}')
                    continue
                # Skip if already exists (best-effort) to avoid overwrite = False collision
                if default_storage.exists(rel):
                    continue
                with open(local_path, 'rb') as fh:
                    default_storage.save(rel, fh)
                uploaded += 1
                if uploaded % 50 == 0:
                    self.stdout.write(f'Uploaded {uploaded} files...')

        if dry:
            self.stdout.write(self.style.SUCCESS(f'Dry-run complete. {count} candidate files.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Migration complete. {uploaded} uploaded (of {count} scanned).'))