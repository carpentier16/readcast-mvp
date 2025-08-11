from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import ConfigDict
from sqlmodel import SQLModel, Field, Session, create_engine

from ..settings import settings

class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    DONE = "DONE"
    ERROR = "ERROR"

class Job(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: str = Field(primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    status: JobStatus = Field(default=JobStatus.PENDING, nullable=False)

    input_filename: str
    lang: Optional[str] = None
    voice: Optional[str] = None

    error: Optional[str] = None
    duration_sec: int = 0

    output_mp3_url: Optional[str] = None
    output_m4b_url: Optional[str] = None
    chapters_json_url: Optional[str] = None
    preview_text: Optional[str] = None

def get_engine(db_url: str | None = None):
    url = db_url or settings.DATABASE_URL
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args)

def get_session_maker(engine):
    def _session():
        return Session(engine)
    return _session
