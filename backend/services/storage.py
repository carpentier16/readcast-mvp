# backend/services/storage.py
import os
import boto3
from botocore.config import Config

from ..settings import settings

# ---------- S3 / Backblaze client ----------

def _s3_client():
    """
    Crée un client S3 compatible Backblaze B2 (ou autre S3).
    Utilise les creds/region/endpoint de settings.
    """
    session = boto3.session.Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    cfg = Config(s3={"addressing_style": "auto"})
    return session.client("s3", endpoint_url=settings.S3_ENDPOINT_URL, config=cfg)


# ---------- Content-Type helper ----------

def _guess_content_type(key: str) -> str:
    k = key.lower()
    if k.endswith(".mp3"):
        return "audio/mpeg"
    if k.endswith(".m4b") or k.endswith(".m4a"):
        return "audio/mp4"
    if k.endswith(".pdf"):
        return "application/pdf"
    return "application/octet-stream"


# ---------- Upload + URL présignée pour lecture ----------

def put_file_s3(src_path: str, dst_path: str) -> str:
    """
    Upload vers S3 et renvoie une URL présignée (lecture/stream) avec expiration.
    """
    client = _s3_client()
    bucket = settings.S3_BUCKET

    client.upload_file(
        src_path,
        bucket,
        dst_path,
        ExtraArgs={"ContentType": _guess_content_type(dst_path)},
    )

    expires = int(os.getenv("S3_SIGN_URL_EXPIRY", "604800"))  # 7 jours par défaut
    url = client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket, "Key": dst_path},
        ExpiresIn=expires,
    )
    return url


def put_file(src_path: str, dst_path: str) -> str:
    """
    Fonction utilisée ailleurs dans le code — garde la même API.
    """
    return put_file_s3(src_path, dst_path)


# ---------- URL présignée dédiée au téléchargement ----------

def presign_key(key: str, filename: str, as_attachment: bool = False, expires: int | None = None) -> str:
    """
    Génère une URL présignée pour l'objet `key`.
    - as_attachment=True => force le téléchargement (Content-Disposition: attachment)
    - filename => nom proposé au téléchargement
    """
    if expires is None:
        expires = int(os.getenv("S3_SIGN_URL_EXPIRY", "604800"))
    client = _s3_client()
    params = {"Bucket": settings.S3_BUCKET, "Key": key}
    if as_attachment:
        params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'
    return client.generate_presigned_url("get_object", Params=params, ExpiresIn=expires)
