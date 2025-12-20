import os
import urllib.parse
from io import BytesIO

import boto3
from PIL import Image

s3 = boto3.client("s3")

SIZES = [480, 768]
ALLOWED_EXT = (".jpg", ".jpeg", ".png", ".webp")  # originales pueden ser jpg/png

def head_exists(bucket: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except Exception:
        return False

def to_webp(image_bytes: bytes, target_width: int) -> bytes:
    img = Image.open(BytesIO(image_bytes))
    img = img.convert("RGB")  # webp sin alpha para fotos (si hay PNG con alpha, podemos mejorar)
    w, h = img.size

    if w > target_width:
        new_h = int((target_width / w) * h)
        img = img.resize((target_width, new_h), Image.LANCZOS)

    out = BytesIO()
    img.save(out, format="WEBP", quality=82, method=6)  # calidad razonable
    return out.getvalue()

def build_derived_key(original_key: str, size: int) -> str:
    # original: properties/original/<propertyId>/<filename>.JPG
    # derived:  properties/derived/<size>/<propertyId>/<filename>.webp
    # Mantiene el mismo filename base, pero cambia extensión a .webp
    derived_key = original_key.replace("properties/original/", f"properties/derived/{size}/", 1)
    # Reemplazar extensión por .webp
    lower = derived_key.lower()
    for ext in [".jpeg", ".jpg", ".png", ".webp"]:
        if lower.endswith(ext):
            derived_key = derived_key[: -len(ext)] + ".webp"
            break
    return derived_key

def lambda_handler(event, context):
    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])

        # Evitar loops y procesar solo originales
        if not key.startswith("properties/original/"):
            continue

        if not key.lower().endswith(ALLOWED_EXT):
            continue

        # Descargar original
        obj = s3.get_object(Bucket=bucket, Key=key)
        original_bytes = obj["Body"].read()

        for size in SIZES:
            derived_key = build_derived_key(key, size)

            # Idempotencia: si ya existe, skip
            if head_exists(bucket, derived_key):
                continue

            webp_bytes = to_webp(original_bytes, size)

            s3.put_object(
                Bucket=bucket,
                Key=derived_key,
                Body=webp_bytes,
                ContentType="image/webp",
                CacheControl="public, max-age=31536000, immutable",
            )

    return {"ok": True}
