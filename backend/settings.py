# backend/settings.py

from __future__ import annotations

import os
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Pydantic v2 config (lit .env / .env.production / .env.local si présents)
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.production", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App ---
    ENV: str = "dev"
    API_BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me"

    # --- Storage ---
    STORAGE_MODE: str = "local"        # "local" ou "s3"
    LOCAL_STORAGE_PATH: str = "./data"  # dossier de travail/outputs en local

    # --- S3 / Backblaze ---
    S3_ENDPOINT_URL: Optional[str] = None
    S3_BUCKET: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None

    # --- Queue / DB ---
    REDIS_URL: str = "redis://localhost:6379"
    RQ_QUEUE_NAME: str = "mvp_jobs"

    DATABASE_URL: str = "sqlite:///./mvp.db"

    # --- TTS provider (par défaut ElevenLabs) ---
    TTS_PROVIDER: str = "elevenlabs"
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "Rachel"

    AZURE_TTS_KEY: Optional[str] = None
    AZURE_TTS_REGION: Optional[str] = None

    OPENAI_API_KEY: Optional[str] = None

    # Optionnel: si tu seras amené à servir via CDN
    PUBLIC_CDN_BASE: Optional[str] = None

    # --- CORS ---
    # Accepte soit une liste JSON/py, soit une string "url1,url2"
    CORS_ORIGINS: List[str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors(cls, v):
        if v is None:
            return ["*"]
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["*"]
            return [s.strip() for s in v.split(",")]
        return v


settings = Settings()

# S’assure que le dossier local existe (utile en mode Docker/Render)
os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
