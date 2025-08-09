from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    ENV: str = "dev"
    API_BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me"

    STORAGE_MODE: str = "local"  # local or s3
    LOCAL_STORAGE_PATH: str = "./data"

    S3_ENDPOINT_URL: str | None = None
    S3_BUCKET: str | None = None
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_REGION: str | None = None

    REDIS_URL: str = "redis://localhost:6379"
    RQ_QUEUE_NAME: str = "mvp_jobs"

    DATABASE_URL: str = "sqlite:///./mvp.db"

    TTS_PROVIDER: str = "elevenlabs"
    ELEVENLABS_API_KEY: str | None = None
    ELEVENLABS_VOICE_ID: str = "Rachel"

    AZURE_TTS_KEY: str | None = None
    AZURE_TTS_REGION: str | None = None

    OPENAI_API_KEY: str | None = None
    PUBLIC_CDN_BASE: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
