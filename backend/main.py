# backend/main.py
import os
import shutil
import asyncio
from uuid import uuid4
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import rq
import redis

from .settings import settings
from .models.db import (
    Base,                 # pour create_all
    Job,
    JobStatus,
    get_engine,
    get_session_maker,
)
from .workers.processor import process_job
from .services.storage import presign_key

from sse_starlette.sse import EventSourceResponse

# ---------- App ----------
app = FastAPI(title="Readcast API", version="0.1.0")

# CORS (ton domaine Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://readcast-mvp.vercel.app",
        # "http://localhost:5173",  # utile si tu fais du local un jour
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DB ----------
engine = get_engine(settings.DATABASE_URL)
SessionLocal = get_session_maker(engine)

# crée les tables si absentes
@app.on_event("startup")
def _init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("[startup] DB ready")
    except Exception as e:
        print(f"[startup] DB init error: {e}")

# ---------- Queue ----------
redis_conn = redis.from_url(settings.REDIS_URL)
queue = rq.Queue(settings.RQ_QUEUE_NAME, connection=redis_conn)

# ---------- Schemas ----------
class JobOut(BaseModel):
    id: str
    status: str
    input_filename: str
    output_mp3_url: Optional[str] = None   # URL (stream)
    output_m4b_url: Optional[str] = None
    error: Optional[str] = None
    # liens de téléchargement (Content-Disposition: attachment)
    download_mp3_url: Optional[str] = None
    download_m4b_url: Optional[str] = None

    class Config:
        from_attributes = True

# ---------- Utils ----------
def _save_upload_to_inputs(upload: UploadFile, job_id: str) -> str:
    base_dir = settings.LOCAL_STORAGE_PATH
    inputs_dir = os.path.join(base_dir, "inputs")
    os.makedirs(inputs_dir, exist_ok=True)

    safe_name = upload.filename or f"{job_id}.pdf"
    dst_path = os.path.join(inputs_dir, f"{job_id}_{safe_name.replace(' ', '_')}")
    with open(dst_path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return dst_path

def _job_key_mp3(job_id: str) -> str:
    return f"outputs/{job_id}/output.mp3"

def _job_key_m4b(job_id: str) -> str:
    return f"outputs/{job_id}/output.m4b"

def _serialize_job_with_downloads(job: Job) -> JobOut:
    out = JobOut(
        id=job.id,
        status=job.status.value if hasattr(job.status, "value") else str(job.status),
        input_filename=job.input_filename,
        output_mp3_url=job.output_mp3_url,
        output_m4b_url=job.output_m4b_url,
        error=job.error,
    )
    if out.status == "DONE":
        base = (job.input_filename or f"{job.id}.pdf").rsplit(".", 1)[0]
        out.download_mp3_url = presign_key(_job_key_mp3(job.id), f"{base}.mp3", as_attachment=True)
        out.download_m4b_url = presign_key(_job_key_m4b(job.id), f"{base}.m4b", as_attachment=True)
    return out

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
        return _serialize_job_with_downloads(job)
    finally:
        session.close()

@app.get("/api/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: str):
    session = SessionLocal()
    try:
        job = session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job introuvable")
        return _serialize_job_with_downloads(job)
    finally:
        session.close()

# ---------- SSE temps réel ----------
@app.get("/api/jobs/{job_id}/events")
async def job_events(job_id: str):
    async def event_generator():
        while True:
            session = SessionLocal()
            try:
                job = session.get(Job, job_id)
                if not job:
                    yield {"event": "message", "data": '{"error":"Job not found"}'}
                    return
                payload = _serialize_job_with_downloads(job).model_dump_json()
                yield {"event": "message", "data": payload}
                if job.status.name in ("DONE", "ERROR"):
                    return
            finally:
                session.close()
            await asyncio.sleep(1)
    return EventSourceResponse(event_generator())

