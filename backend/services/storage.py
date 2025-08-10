# backend/services/storage.py
import os
import boto3
from botocore.config import Config

from ..settings import settings

def _s3_client():
    session = boto3.session.Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    cfg = Config(s3={"addressing_style": "auto"})
    return session.client("s3", endpoint_url=settings.S3_ENDPOINT_URL, config=cfg)

def put_file_s3(src_path: str, dst_path: str) -> str:
    client = _s3_client()
    bucket = settings.S3_BUCKET
    client.upload_file(src_path, bucket, dst_path, ExtraArgs={"ContentType": _guess_content_type(dst_path)})
    # URL présignée valide X secondes (par défaut 7 jours)
    expires = int(os.getenv("S3_SIGN_URL_EXPIRY", "604800"))
    url = client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket, "Key": dst_path},
        ExpiresIn=expires,
    )
    return url

def _guess_content_type(key: str) -> str:
    if key.endswith(".mp3"):
        return "audio/mpeg"
    if key.endswith(".m4b") or key.endswith(".m4a"):
        return "audio/mp4"
    if key.endswith(".pdf"):
        return "application/pdf"
    return "application/octet-stream"

def put_file(src_path: str, dst_path: str) -> str:
    # Pour l’instant on n’implémente que S3 (Backblaze)
    return put_file_s3(src_path, dst_path)
