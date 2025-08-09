from datetime import datetime
from enum import Enum
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Text
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    DONE = "DONE"
    ERROR = "ERROR"

class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default=JobStatus.PENDING)
    input_filename = Column(String)
    lang = Column(String, default="fra")
    voice = Column(String, default="Rachel")
    error = Column(Text, nullable=True)
    duration_sec = Column(Integer, default=0)
    output_mp3_url = Column(String, nullable=True)
    output_m4b_url = Column(String, nullable=True)
    chapters_json_url = Column(String, nullable=True)

def get_engine(db_url: str):
    return create_engine(db_url, future=True)

def get_session_maker(engine):
    return sessionmaker(bind=engine, expire_on_commit=False)
