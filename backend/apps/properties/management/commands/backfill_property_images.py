import os
import boto3
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.properties.models import PropertyImage
from botocore.exceptions import ClientError


def _force_dry_run(commit: bool, dry_run_flag: bool) -> bool:
    # Si no hay --commit, siempre es dry-run
    if not commit:
        return True
    return dry_run_flag


def _is_original_key(key: str) -> bool:
    return bool(key) and key.startswith("properties/original/")


def _to_webp_key(key: str) -> str:
    # Cambia extensión a .webp (maneja JPG/JPEG/PNG/WEBP con mayúsculas)
    lower = key.lower()
    for ext in (".jpeg", ".jpg", ".png", ".webp"):
        if lower.endswith(ext):
            return key[: -len(ext)] + ".webp"
    # Si no tiene extensión clara, igual forzamos .webp
    return key + ".webp"


def _build_derived_key(original_key: str, size: int) -> str:
    # original: properties/original/<propertyId>/<filename>.(jpg/png)
    # derived:  properties/derived/<size>/<propertyId>/<filename>.webp
    derived_key = original_key.replace(
        "properties/original/", f"properties/derived/{size}/", 1
    )
    return _to_webp_key(derived_key)


def _head_exists(s3, bucket: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


class Command(BaseCommand):
    help = "Backfill property images to new S3 structure and/or retrigger Lambda derived thumbnails"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", default=False,
                            help="Dry run mode (default if not commit)")
        parser.add_argument("--commit", action="store_true",
                            help="Commit changes to DB and S3")
        parser.add_argument("--limit", type=int,
                            help="Limit number of images to process (applies after filtering)")
        parser.add_argument("--only-missing", action="store_true",
                            help="Skip copy if destination exists (migration mode)")

        # NUEVOS FLAGS
        parser.add_argument("--include-original", action="store_true",
                            help="Include images that are already in properties/original/")
        parser.add_argument("--only-original", action="store_true",
                            help="Process ONLY images already in properties/original/ (skip migration of old keys)")
        parser.add_argument("--retrigger-missing-derived", action="store_true",
                            help="For images already in properties/original/, check derived sizes and copy-to-self if missing to retrigger Lambda.")
        parser.add_argument("--sizes", type=str, default="480,768",
                            help="Comma-separated sizes to check/generate (default: 480,768)")
        parser.add_argument("--property-id", type=int,
                            help="Process only images belonging to a given property_id")

    def handle(self, *args, **options):
        commit = options["commit"]
        dry_run = _force_dry_run(commit, options["dry_run"])
        limit = options["limit"]
        only_missing = options["only_missing"]

        include_original = options["include_original"]
        only_original = options["only_original"]
        retrigger_missing_derived = options["retrigger_missing_derived"]
        property_id = options["property_id"]

        try:
            sizes = [int(s.strip()) for s in options["sizes"].split(",") if s.strip()]
        except ValueError:
            raise ValueError("--sizes debe ser una lista de enteros separada por coma, ej: 480,768")

        self.stdout.write(f"Starting backfill. Dry run: {dry_run}, Commit: {commit}")
        self.stdout.write(f"Options: include_original={include_original}, only_original={only_original}, "
                          f"retrigger_missing_derived={retrigger_missing_derived}, sizes={sizes}, property_id={property_id}")

        qs = PropertyImage.objects.all().order_by("id")
        if property_id:
            qs = qs.filter(property_id=property_id)

        # Modo por defecto: igual que antes (solo no-original)
        if not include_original and not only_original and not retrigger_missing_derived:
            qs = qs.exclude(s3_key__startswith="properties/original/")

        # Si only_original: nos quedamos solo con originales
        if only_original:
            qs = qs.filter(s3_key__startswith="properties/original/")

        # Si include_original: no filtramos nada extra (incluye todo)
        # Si retrigger_missing_derived: lo aplicamos por lógica dentro del loop.

        if limit:
            qs = qs[:limit]
            images = list(qs)
        else:
            images = list(qs)

        total = len(images)
        self.stdout.write(f"Found {total} images to process")

        s3 = boto3.client("s3", region_name="us-east-1")
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        processed_count = 0
        success_count = 0
        skipped_count = 0
        error_count = 0
        retriggered_count = 0
        already_ok_count = 0

        for img in images:
            processed_count += 1

            # Determine current key
            current_key = img.s3_key or (img.image.name if img.image else None)
            if not current_key:
                self.stdout.write(self.style.WARNING(
                    f"[{processed_count}/{total}] Image {img.id} has no s3_key or image file. Skipping."
                ))
                skipped_count += 1
                continue

            # 1) RETRIGGER MODE (para keys ya en original)
            if retrigger_missing_derived and _is_original_key(current_key):
                derived_keys = [(size, _build_derived_key(current_key, size)) for size in sizes]
                missing = []
                for size, dkey in derived_keys:
                    if not _head_exists(s3, bucket_name, dkey):
                        missing.append((size, dkey))

                if not missing:
                    already_ok_count += 1
                    self.stdout.write(self.style.SUCCESS(
                        f"[{processed_count}/{total}] Image {img.id} original OK, derived exists for {sizes}. Skipping retrigger."
                    ))
                    continue

                self.stdout.write(
                    f"[{processed_count}/{total}] Image {img.id} missing derived sizes: {[m[0] for m in missing]} -> retrigger copy-to-self {current_key}"
                )

                if dry_run:
                    self.stdout.write(self.style.SUCCESS(
                        f"  [DRY-RUN] Would copy-to-self {current_key} (to retrigger Lambda)"
                    ))
                    continue

                try:
                    # Head original to preserve metadata (evita borrar metadata al REPLACE)
                    head = s3.head_object(Bucket=bucket_name, Key=current_key)
                    metadata = head.get("Metadata", {}) or {}

                    # Forzar re-escritura (y evento) usando REPLACE
                    s3.copy_object(
                        Bucket=bucket_name,
                        CopySource={"Bucket": bucket_name, "Key": current_key},
                        Key=current_key,
                        Metadata=metadata,
                        MetadataDirective="REPLACE",
                        ContentType=head.get("ContentType", "image/jpeg"),
                        CacheControl=head.get("CacheControl", "public, max-age=31536000, immutable"),
                    )
                    retriggered_count += 1
                    success_count += 1
                    self.stdout.write(self.style.SUCCESS("  Retrigger success"))
                except Exception as e:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(f"  Retrigger error image {img.id}: {str(e)}"))

                continue

            # 2) MIGRATION MODE (lo que ya hacían antes) para keys viejas fuera de original
            # Si current_key ya está en original y no pidieron include_original, esto no se ejecuta
            if _is_original_key(current_key):
                # Si llegamos acá, es porque include_original/only_original está activo, pero no estamos retriggering.
                # No hacemos nada para no duplicar trabajo.
                skipped_count += 1
                self.stdout.write(
                    f"[{processed_count}/{total}] Image {img.id} already in original and no retrigger requested. Skipping."
                )
                continue

            old_key = current_key
            basename = os.path.basename(old_key)
            new_key = f"properties/original/{img.property_id}/{img.id}-{basename}"

            self.stdout.write(f"[{processed_count}/{total}] Migrating ID {img.id}: {old_key} -> {new_key}")

            if dry_run:
                self.stdout.write(self.style.SUCCESS(
                    f"  [DRY-RUN] Would copy {old_key} to {new_key} and update DB"
                ))
                continue

            try:
                # Check if destination exists if requested
                should_copy = True
                if only_missing:
                    if _head_exists(s3, bucket_name, new_key):
                        self.stdout.write(f"  Destination {new_key} already exists. Skipping copy.")
                        should_copy = False

                if should_copy:
                    self.stdout.write("  Copying S3 object...")
                    s3.copy_object(
                        Bucket=bucket_name,
                        CopySource={"Bucket": bucket_name, "Key": old_key},
                        Key=new_key,
                        MetadataDirective="COPY",
                    )

                # Update DB
                img.s3_key = new_key
                if img.url and old_key in img.url:
                    img.url = img.url.replace(old_key, new_key)
                img.save()

                success_count += 1
                self.stdout.write(self.style.SUCCESS("  Success"))

            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f"  Error processing image {img.id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(
            f"Finished. Processed: {processed_count}, Success: {success_count}, "
            f"Retriggered: {retriggered_count}, AlreadyOK: {already_ok_count}, "
            f"Skipped: {skipped_count}, Errors: {error_count}"
        ))
