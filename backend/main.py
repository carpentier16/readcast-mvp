# backend/main.py
import os
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4
import shutil
import rq
import redis

from .settings import settings
from .models.db import (
    Job,
    JobStatus,
    get_engine,
    get_session_maker,
    Base,  # << IMPORTANT: on importe Base pour create_all
)

from .workers.processor import process_job

# ---------- FastAPI ----------
app = FastAPI(title="Readcast API", version="0.1.0")

# CORS — autorise ton frontend Vercel à appeler l’API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://readcast-mvp.vercel.app",
        # "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DB ----------
engine = get_engine(settings.DATABASE_URL)
SessionLocal = get_session_maker(engine)

# >>> Crée les tables au démarrage si elles n'existent pas
@app.on_event("startup")
def _init_db():
    try:
        Base.metadata.create_all(bind=engine)
        # print("DB ready")  # optionnel pour logs
    except Exception as e:
        print(f"[startup] DB init error: {e}")

# ---------- RQ / Redis ----------
redis_conn = redis.from_url(settings.REDIS_URL)
queue = rq.Queue(settings.RQ_QUEUE_NAME, connection=redis_conn)

# ---------- Schemas ----------
class JobOut(BaseModel):
    id: str
    status: str
    input_filename: str
    output_mp3_url: Optional[str] = None
    output_m4b_url: Optional[str] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Utils ----------
def _save_upload_to_inputs(upload: UploadFile, job_id: str) -> str:
    """Enregistre le PDF uploadé dans le dossier inputs avec un nom stable."""
    base_dir = settings.LOCAL_STORAGE_PATH
    inputs_dir = os.path.join(base_dir, "inputs")
    os.makedirs(inputs_dir, exist_ok=True)

    safe_name = upload.filename or f"{job_id}.pdf"
    dst_path = os.path.join(inputs_dir, f"{job_id}_{safe_name.replace(' ', '_')}")
    with open(dst_path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return dst_path


def _serialize_job(job: Job) -> JobOut:
    return JobOut(
        id=job.id,
        status=job.status.value if hasattr(job.status, "value") else str(job.status),
        input_filename=job.input_filename,
        output_mp3_url=job.output_mp3_url,
        output_m4b_url=job.output_m4b_url,
        error=job.error,
    )


# ---------- Routes ----------
@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/jobs", response_model=JobOut)
async def create_job(
    file: UploadFile = File(...),
    voice: str = Form("Rachel"),
    lang: str = Form("fra"),
):
    """
    1) Enregistre le PDF en local
    2) Crée la ligne en DB (PENDING)
    3) Enqueue le worker RQ
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Le fichier doit être un PDF")

    job_id = str(uuid4())
    local_path = _save_upload_to_inputs(file, job_id)

    session = SessionLocal()
    try:
        job = Job(
            id=job_id,
            status=JobStatus.PENDING,
            input_filename=file.filename,
            output_mp3_url=None,
            output_m4b_url=None,
            error=None,
        )
        session.add(job)
        session.commit()

        queue.enqueue(process_job, job_id, local_path, voice, lang)

        job = session.get(Job, job_id)
        return _serialize_job(job)
    finally:
        session.close()


@app.get("/api/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: str):
    session = SessionLocal()
    try:
        job = session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job introuvable")
        return _serialize_job(job)
    finally:
        session.close()
