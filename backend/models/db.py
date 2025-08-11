# backend/models/db.py
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from enum import Enum
from ..settings import settings
from sqlmodel import SQLModel, Field, create_engine, Session
import uuid

class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    DONE = "DONE"
    ERROR = "ERROR"

class Job(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    status: JobStatus = Field(sa_column=Column(SQLEnum(JobStatus), nullable=False, default=JobStatus.PENDING))
    input_filename: str
    output_mp3_url: str | None = None
    output_m4b_url: str | None = None
    error: str | None = None
    preview_text: str | None = None  # 🔹 Nouveau champ
    created_at: DateTime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))

def get_engine(db_url: str):
    return create_engine(db_url, connect_args={"check_same_thread": False} if db_url.startswith("sqlite") else {})

def get_session_maker(engine):
    from sqlmodel import sessionmaker
    return sessionmaker(engine, expire_on_commit=False)

