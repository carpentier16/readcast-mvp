from __future__ import annotations

import asyncio
import os
import time
import uuid
from typing import Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from .settings import settings
from .models.db import Job, JobStatus, get_engine, get_session_maker
from .workers.processor import process_job

# RQ / Redis
from rq import Queue
from redis import Redis

# Pydantic (v2)
from pydantic import BaseModel

# -------------------------------------------------
# App & CORS
# -------------------------------------------------
app = FastAPI(title="Readcast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or [],
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# DB
# -------------------------------------------------
engine = get_engine(settings.DATABASE_URL)
SessionLocal = get_session_maker(engine)

def db_session():
    """Dependency simple pour ouvrir/fermer une session DB."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

# -------------------------------------------------
# Redis / RQ
# -------------------------------------------------
redis_conn = Redis.from_url(settings.REDIS_URL)
rq_queue = Queue(settings.RQ_QUEUE_NAME, connection=redis_conn)

# -------------------------------------------------
# Pydantic Schemas (réponses API)
# -------------------------------------------------
class JobCreateResponse(BaseModel):
    id: str
    status: str

class JobGetResponse(BaseModel):
    id: str
    status: str
    input_filename: Optional[str] = None
    output_mp3_url: Optional[str] = None
    output_m4b_url: Optional[str] = None
    error: Optional[str] = None

# -------------------------------------------------
# Startup: créer tables + dossiers
# -------------------------------------------------
@app.on_event("startup")
def on_startup():
    # Créer tables si besoin
    try:
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(engine)
    except Exception:
        # Si ton module DB fournit déjà la création, ignore
        pass

    # Créer répertoires de stockage local
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    os.makedirs(os.path.join(settings.LOCAL_STORAGE_PATH, "inputs"), exist_ok=True)
    os.makedirs(os.path.join(settings.LOCAL_STORAGE_PATH, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(settings.LOCAL_STORAGE_PATH, "tmp"), exist_ok=True)

# -------------------------------------------------
# Health
# -------------------------------------------------
@app.get("/health")
def health():
    return {"ok": True}

# -------------------------------------------------
# Créer un job
# -------------------------------------------------
@app.post("/api/jobs", response_model=JobCreateResponse)
async def create_job(
    file: UploadFile = File(...),
    voice: Optional[str] = Form(None),
    lang: str = Form("fra"),
    session=Depends(db_session),
):
    # Sécuriser type MIME
    if not file.content_type or "pdf" not in file.content_type:
        raise HTTPException(status_code=400, detail="Veuillez envoyer un PDF.")

    # Créer Job en DB
    job_id = str(uuid.uuid4())
    job = Job(
        id=job_id,
        status=JobStatus.PENDING,
        input_filename=file.filename,
        lang=lang,
        voice=voice or settings.ELEVENLABS_VOICE_ID,
    )
    session.add(job)
    session.commit()

    # Enregistrer fichier en local
    input_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "inputs")
    os.makedirs(input_dir, exist_ok=True)
    local_path = os.path.join(input_dir, f"{job_id}_{file.filename}")

    with open(local_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Enqueue le traitement dans RQ (worker)
    rq_queue.enqueue(process_job, job_id, local_path, job.voice, job.lang)

    return JobCreateResponse(id=job_id, status=job.status.value)

# -------------------------------------------------
# Récupérer un job
# -------------------------------------------------
@app.get("/api/jobs/{job_id}", response_model=JobGetResponse)
def get_job(job_id: str, session=Depends(db_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable")

    return JobGetResponse(
        id=job.id,
        status=job.status.value,
        input_filename=job.input_filename,
        output_mp3_url=job.output_mp3_url,
        output_m4b_url=job.output_m4b_url,
        error=job.error,
    )

# -------------------------------------------------
# SSE : statut en temps réel (poll DB)
# -------------------------------------------------
@app.get("/api/jobs/{job_id}/events")
async def stream_job_events(job_id: str):
    """
    SSE très simple: on poll la DB toutes les 1s et on envoie l'état.
    Côté front, EventSource reçoit ces événements.
    """
    async def event_generator():
        last_payload = None
        while True:
            # Lire DB (via nouvelle session par itération pour éviter les connexions bloquées)
            session = SessionLocal()
            job = session.get(Job, job_id)
            if not job:
                session.close()
                yield {"event": "error", "data": "Job introuvable"}
                return

            payload = {
                "id": job.id,
                "status": job.status.value,
                "mp3": job.output_mp3_url,
                "m4b": job.output_m4b_url,
                "error": job.error,
            }

            # N'émettre que si changement (pour éviter le spam)
            if payload != last_payload:
                last_payload = payload
                yield {"event": "update", "data": JSONResponse(content=payload).body.decode()}

                # Stopper si terminé/erreur
                if job.status in (JobStatus.DONE, JobStatus.ERROR):
                    session.close()
                    return

            session.close()
            await asyncio.sleep(1.0)

    return EventSourceResponse(event_generator(), ping=15000)
