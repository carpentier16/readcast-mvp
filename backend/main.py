# backend/main.py
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import shutil, os, asyncio
from .models.db import Job, JobStatus, get_engine, get_session_maker, SQLModel
from .settings import settings
from .workers.processor import process_job
from .services.utils import safe_slug
from sse_starlette.sse import EventSourceResponse

engine = get_engine(settings.DATABASE_URL)
SQLModel.metadata.create_all(engine)
Session = get_session_maker(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://readcast-mvp.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/jobs")
async def create_job(file: UploadFile, voice: str = Form("Rachel"), lang: str = Form("fra")):
    session = Session()
    job = Job(input_filename=file.filename)
    session.add(job)
    session.commit()

    local_path = os.path.join(settings.LOCAL_STORAGE_PATH, f"uploads/{job.id}_{safe_slug(file.filename)}")
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, process_job, job.id, local_path, voice, lang)

    return {"id": job.id}

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    session = Session()
    job = session.get(Job, job_id)
    if not job:
        return {"error": "Not found"}
    return job.dict()

@app.get("/api/jobs/{job_id}/events")
async def job_events(job_id: str):
    async def event_generator():
        while True:
            session = Session()
            job = session.get(Job, job_id)
            if not job:
                break
            if job.status == JobStatus.DONE or job.status == JobStatus.ERROR:
                yield {"event": "end", "data": job.status}
                break
            progress = 0
            if job.error and job.error.startswith("PROGRESS::"):
                progress = int(job.error.split("::")[1])
            yield {"event": "progress", "data": str(progress)}
            await asyncio.sleep(1)
    return EventSourceResponse(event_generator())

@app.get("/api/jobs/history")
def get_history():
    session = Session()
    jobs = session.query(Job).order_by(Job.created_at.desc()).limit(20).all()
    return [job.dict() for job in jobs]
