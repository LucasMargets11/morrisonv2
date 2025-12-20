import boto3
import os
import io
from PIL import Image
import urllib.parse

s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    AWS Lambda function to resize images triggered by S3 ObjectCreated.
    Requires Pillow layer.
    """
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(record['s3']['object']['key'])
        
        # Only process images in properties/original/
        if 'properties/original/' not in key:
            print(f"Skipping key {key}: not in properties/original/")
            continue
            
        # Extract base path: properties/original/123/abc.jpg -> 123/abc
        try:
            relative_path = key.split('properties/original/', 1)[1]
            base_name = relative_path.rsplit('.', 1)[0]
        except IndexError:
            print(f"Skipping key {key}: could not parse path")
            continue

        print(f"Processing {key}...")
        
        try:
            # Download image
            response = s3.get_object(Bucket=bucket, Key=key)
            image_content = response['Body'].read()
            
            with Image.open(io.BytesIO(image_content)) as img:
                # Fix orientation if needed (EXIF)
                try:
                    from PIL import ImageOps
                    img = ImageOps.exif_transpose(img)
                except Exception:
                    pass

                # Convert to RGB if necessary (e.g. RGBA to RGB for JPEG/WebP)
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1])
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')

                # Generate sizes
                sizes = [
                    (480, 'properties/derived/480'),
                    (768, 'properties/derived/768'),
                    # (1280, 'properties/derived/1280'), # Optional
                ]

                for width, prefix in sizes:
                    # Calculate height maintaining aspect ratio
                    # Only resize if original is larger than target
                    if img.size[0] > width:
                        w_percent = (width / float(img.size[0]))
                        h_size = int((float(img.size[1]) * float(w_percent)))
                        img_resized = img.resize((width, h_size), Image.Resampling.LANCZOS)
                    else:
                        img_resized = img

                    # Save to buffer as WebP
                    buffer = io.BytesIO()
                    img_resized.save(buffer, format="WEBP", quality=80, method=6)
                    buffer.seek(0)
                    
                    # Upload
                    new_key = f"{prefix}/{base_name}.webp"
                    print(f"Uploading to {new_key}")
                    
                    s3.put_object(
                        Bucket=bucket,
                        Key=new_key,
                        Body=buffer,
                        ContentType='image/webp',
                        CacheControl='public, max-age=31536000, immutable'
                    )
                    
        except Exception as e:
            print(f"Error processing {key}: {str(e)}")
            raise e
            
    return {
        'statusCode': 200,
        'body': 'Images processed successfully'
    }
