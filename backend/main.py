from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uuid import uuid4
import os, shutil
from .settings import settings
from .models.db import Base, get_engine, get_session_maker, Job, JobStatus
from sqlalchemy import select
from redis import Redis
from rq import Queue
from .workers.processor import process_job

engine = get_engine(settings.DATABASE_URL)
Base.metadata.create_all(engine)
SessionLocal = get_session_maker(engine)

app = FastAPI(title="Audiobook MVP API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.STORAGE_MODE == "local":
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    app.mount("/files", StaticFiles(directory=settings.LOCAL_STORAGE_PATH), name="files")

redis = Redis.from_url(settings.REDIS_URL)
queue = Queue(settings.RQ_QUEUE_NAME, connection=redis)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/jobs")
async def create_job(file: UploadFile = File(...), voice: str = Form("Rachel"), lang: str = Form("fra")):
    job_id = str(uuid4())
    input_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "inputs")
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, f"{job_id}_{file.filename}")
    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    session = SessionLocal()
    jb = Job(id=job_id, input_filename=file.filename, status=JobStatus.PENDING, voice=voice, lang=lang)
    session.add(jb)
    session.commit()
    session.close()

    queue.enqueue(process_job, job_id, input_path, voice, lang)
    return {"job_id": job_id}

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    session = SessionLocal()
    jb = session.get(Job, job_id)
    if not jb:
        session.close()
        return {"error": "not found"}
    data = {
        "id": jb.id,
        "status": jb.status,
        "input_filename": jb.input_filename,
        "output_mp3_url": jb.output_mp3_url if jb.output_mp3_url else None,
        "output_m4b_url": jb.output_m4b_url if jb.output_m4b_url else None,
        "error": jb.error
    }
    session.close()
    return data
