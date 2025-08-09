import os
from ..settings import settings
from . import utils
import boto3

def _s3_client():
    session = boto3.session.Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    if settings.S3_ENDPOINT_URL:
        return session.client('s3', endpoint_url=settings.S3_ENDPOINT_URL)
    return session.client('s3')

def put_file_local(src_path: str, dst_path: str) -> str:
    abspath = os.path.join(settings.LOCAL_STORAGE_PATH, dst_path.lstrip('/'))
    os.makedirs(os.path.dirname(abspath), exist_ok=True)
    utils.copy_file(src_path, abspath)
    return f"/{dst_path.lstrip('/')}"

def put_file_s3(src_path: str, dst_path: str) -> str:
    client = _s3_client()
    key = dst_path.lstrip('/')
    client.upload_file(src_path, settings.S3_BUCKET, key)
    if settings.PUBLIC_CDN_BASE:
        return f"{settings.PUBLIC_CDN_BASE.rstrip('/')}/{key}"
    return f"s3://{settings.S3_BUCKET}/{key}"

def put_file(src_path: str, dst_path: str) -> str:
    if settings.STORAGE_MODE == "s3":
        return put_file_s3(src_path, dst_path)
    return put_file_local(src_path, dst_path)
