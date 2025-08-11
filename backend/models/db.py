# backend/models/db.py

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import ConfigDict  # Pydantic v2
from sqlmodel import SQLModel, Field, Session, create_engine

# If your settings live elsewhere, adjust this import:
from ..settings import settings


# ---------- Enum status ----------
class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    DONE = "DONE"
    ERROR = "ERROR"


# ---------- SQLModel ----------
class Job(SQLModel, table=True):
    """
    WARNING:
      Do NOT use SQLAlchemy DateTime in Field (e.g. sa_type=DateTime / sa_column=Column(DateTime,...))
      with Pydantic v2. Use native datetime + default_factory and let SQLModel map it.
    """
    # Allows any stray SQLAlchemy types if you keep some custom columns elsewhere
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

    # Optional: store a short OCR preview in DB to show in UI
    preview_text: Optional[str] = None


# ---------- Engine / Session helpers ----------
def get_engine(db_url: str | None = None):
    url = db_url or settings.DATABASE_URL
    # sqlite needs this flag when used with FastAPI in multi-threaded context
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    engine = create_engine(url, connect_args=connect_args)
    return engine


def get_session_maker(engine):
    """
    Return a callable you can use like:
      SessionLocal = get_session_maker(engine)
      with SessionLocal() as session: ...
    """
    def _session():
        return Session(engine)
    return _session
