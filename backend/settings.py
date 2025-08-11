from __future__ import annotations

import os
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # General
    ENV: str = "dev"
    API_BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me"

    # Storage
    STORAGE_MODE: str = "local"  # "local" or "s3"
    LOCAL_STORAGE_PATH: str = "./data"

    # S3 / Backblaze (S3-compatible)
    S3_ENDPOINT_URL: Optional[str] = None
    S3_BUCKET: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None

    # Redis / RQ
    REDIS_URL: str = "redis://localhost:6379"
    RQ_QUEUE_NAME: str = "mvp_jobs"

    # Database
    DATABASE_URL: str = "sqlite:///./mvp.db"

    # TTS providers
    TTS_PROVIDER: str = "elevenlabs"  # "elevenlabs" or "azure"
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "Rachel"

    AZURE_TTS_KEY: Optional[str] = None
    AZURE_TTS_REGION: Optional[str] = None

    OPENAI_API_KEY: Optional[str] = None

    # Public CDN base (if you proxy S3 links)
    PUBLIC_CDN_BASE: Optional[str] = None

    # --- CORS ---
    # Accept either a JSON list (["https://foo"]) OR a comma-separated string ("https://foo, https://bar")
    CORS_ORIGINS: List[str] = Field(default_factory=list)
    # If you want to allow all *.vercel.app previews, set this to r"https://.*\.vercel\.app"
    CORS_ORIGIN_REGEX: Optional[str] = None

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _coerce_cors_origins(cls, v):
        """
        Allow:
          - list: ['https://a', 'https://b']
          - comma string: 'https://a, https://b'
          - single string: 'https://a'
        Normalize to a list[str] without empty items.
        """
        if v is None or v == "":
            return []
        if isinstance(v, list):
            return [s.strip() for s in v if s and s.strip()]
        if isinstance(v, str):
            # If it looks like a JSON list, pydantic would already parse it,
            # but if someone passed a plain string, split by comma.
            parts = [p.strip() for p in v.split(",")]
            return [p for p in parts if p]
        return v

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure local storage directory exists
os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
