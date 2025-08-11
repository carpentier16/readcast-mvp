from __future__ import annotations

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import AsyncGenerator, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from sqlmodel import SQLModel, Session, select

# === Import de ton code interne (adapte si l’arbo diffère) ===
from .settings import settings
from .models.db import Job, JobStatus, get_engine, get_session_maker  # <- garde ces chemins
# workers.processor.process_job(job_id, local_path, voice, lang)
from .workers.processor import process_job

# RQ (queue) pour lancer le worker
import redis
from rq import Queue


app = FastAPI(title="Readcast API", version="0.1.0")

# CORS (Vercel -> Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not settings.CORS_ORIGINS else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
engine = get_engine(settings.DATABASE_URL)
SessionLocal = get_session_maker(engine)

# RQ / Redis
redis_conn = redis.from_url(settings.REDIS_URL)
queue = Queue(settings.RQ_QUEUE_NAME, connection=redis_conn)

# Dossier local de stockage
LOCAL_ROOT = settings.LOCAL_STORAGE_PATH  # ex: "./data"
os.makedirs(LOCAL_ROOT, exist_ok=True)
os.makedirs(os.path.join(LOCAL_ROOT, "inputs"), exist_ok=True)
os.makedirs(os.path.join(LOCAL_ROOT, "outputs"), exist_ok=True)


# =========================
#   Helpers / Serialization
# =========================

def serialize_job(j: Job) -> dict:
    """Petite fonction pour renvoyer un JSON propre au frontend."""
    return {
        "id": j.id,
        "created_at": j.created_at.isoformat() if isinstance(j.created_at, datetime) else j.created_at,
        "status": j.status.value if hasattr(j.status, "value") else str(j.status),
        "input_filename": j.input_filename,
        "lang": getattr(j, "lang", None),
        "voice": getattr(j, "voice", None),
        "error": j.error,
        "duration_sec": j.duration_sec,
        "output_mp3_url": j.output_mp3_url,
        "output_m4b_url": j.output_m4b_url,
        "chapters_json_url": getattr(j, "chapters_json_url", None),
        # liens "download" = même URLs si tu as activé les b2 permissions publiques
        "download_mp3_url": j.output_mp3_url,
        "download_m4b_url": j.output_m4b_url,
        # si tu stockes un extrait OCR côté DB :
        "preview_text": getattr(j, "preview_text", None),
    }


async def sse_poll_job(job_id: str, interval_s: float = 1.0, max_minutes: int = 30) -> AsyncGenerator[dict, None]:
    """
    Génère un flux SSE en pollant la DB toutes les `interval_s`.
    S'arrête si status est DONE ou ERROR, ou si le timer expire.
    """
    deadline = datetime.utcnow() + timedelta(minutes=max_minutes)
    last_payload: Optional[str] = None

    while datetime.utcnow() < deadline:
        async with asyncio.timeout(60):
            with SessionLocal() as session:
                job = session.get(Job, job_id)
                if not job:
                    # on stoppe s'il n'existe plus
                    payload = {"id": job_id, "status": "ERROR", "error": "Job not found"}
                    yield {"event": "message", "data": json.dumps(payload)}
                    yield {"event": "end", "data": "0"}
                    return

                payload = serialize_job(job)
                payload_json = json.dumps(payload)

                # n'émettre que si changement vs dernier envoi
                if payload_json != last_payload:
                    last_payload = payload_json
                    yield {"event": "message", "data": payload_json}

                if payload["status"] in ("DONE", "ERROR"):
                    yield {"event": "end", "data": "0"}
                    return

        await asyncio.sleep(interval_s)

    # timeout
    yield {"event": "end", "data": "0"}


# =========================
#   Lifecycle
# =========================

@app.on_event("startup")
def on_startup():
    """
    Création des tables à froid (SQLite) / migration simple.
    """
    SQLModel.metadata.create_all(engine)


# =========================
#   Routes
# =========================

@app.get("/health")
def health():
    return {"ok": True, "ts": datetime.utcnow().isoformat()}


@app.post("/api/jobs")
async def create_job(
    file: UploadFile = File(...),
    voice: str = Form("Rachel"),
    lang: str = Form("fra"),
):
    """
    1) Enregistre le fichier PDF dans LOCAL_STORAGE_PATH/inputs
    2) Crée un Job en DB (PENDING)
    3) Enqueue le worker RQ (process_job)
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, detail="Seuls les PDF sont acceptés.")

    # sauver le fichier
    job_id = os.urandom(16).hex()
    input_dir = os.path.join(LOCAL_ROOT, "inputs")
    os.makedirs(input_dir, exist_ok=True)
    local_pdf_path = os.path.join(input_dir, f"{job_id}_{file.filename}")
    with open(local_pdf_path, "wb") as f:
        f.write(await file.read())

    # créer le job
    with SessionLocal() as session:
        job = Job(
            id=job_id,
            created_at=datetime.utcnow(),
            status=JobStatus.PENDING,
            input_filename=file.filename,
            lang=lang,
            voice=voice,
            error=None,
            duration_sec=0,
            output_mp3_url=None,
            output_m4b_url=None,
        )
        session.add(job)
        session.commit()

    # enqueue RQ
    # -> le worker tournera process_job(job_id, local_path, voice, lang)
    queue.enqueue(process_job, job_id, local_pdf_path, voice, lang, job_timeout=60*60)

    return {"id": job_id, "status": "PENDING"}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    with SessionLocal() as session:
        job = session.get(Job, job_id)
        if not job:
            raise HTTPException(404, "Job not found")
        return serialize_job(job)


@app.get("/api/jobs/{job_id}/events")
async def job_events(job_id: str, request: Request):
    """
    SSE : le frontend s'abonne pour recevoir les changements du job en temps réel.
    Implémentation via polling DB interne (simple & robuste sur Render).
    """
    generator = sse_poll_job(job_id, interval_s=1.0, max_minutes=60)
    return EventSourceResponse(generator)


@app.get("/api/jobs/history")
def list_jobs(limit: int = 30):
    """
    Historique (par défaut 30 derniers).
    """
    with SessionLocal() as session:
        stmt = select(Job).order_by(Job.created_at.desc()).limit(limit)
        jobs = session.exec(stmt).all()
        return [serialize_job(j) for j in jobs]
