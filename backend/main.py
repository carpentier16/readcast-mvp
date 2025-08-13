from __future__ import annotations

import asyncio
import os
import time
import uuid
from typing import Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sse_starlette.sse import EventSourceResponse

from .settings import settings
from .models.db import Job, JobStatus, get_engine, get_session_maker
from .models.user import User, UserSession
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
# Sécurité
# -------------------------------------------------
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency pour récupérer l'utilisateur actuel."""
    token = credentials.credentials
    
    # Import lazy pour éviter les imports circulaires
    from .services.auth import auth_service
    
    success, result = auth_service.get_current_user(token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["error"],
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return result["user"]

# -------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_login: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

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
        
        # Créer aussi les tables des modèles personnalisés
        User.metadata.create_all(engine)
        UserSession.metadata.create_all(engine)
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
# Authentification
# -------------------------------------------------
@app.post("/api/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    """Enregistrer un nouvel utilisateur."""
    # Import lazy pour éviter les imports circulaires
    from .services.auth import auth_service
    
    success, result = auth_service.register_user(
        email=user_data.email,
        username=user_data.username,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result

@app.post("/api/auth/login", response_model=dict)
async def login(login_data: UserLogin):
    """Authentifier un utilisateur."""
    # Import lazy pour éviter les imports circulaires
    from .services.auth import auth_service
    
    success, result = auth_service.authenticate_user(
        email_or_username=login_data.email_or_username,
        password=login_data.password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["error"]
        )
    
    return result

@app.post("/api/auth/refresh", response_model=dict)
async def refresh_token(refresh_token: str):
    """Rafraîchir un token d'accès."""
    # Import lazy pour éviter les imports circulaires
    from .services.auth import auth_service
    
    success, result = auth_service.refresh_access_token(refresh_token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["error"]
        )
    
    return result

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Récupérer les informations de l'utilisateur actuel."""
    return current_user

@app.put("/api/auth/profile")
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour le profil de l'utilisateur."""
    # Import lazy pour éviter les imports circulaires
    from .services.auth import auth_service
    
    success, result = auth_service.update_user_profile(
        user_id=current_user["id"],
        **profile_data
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result

@app.post("/api/auth/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """Changer le mot de passe de l'utilisateur."""
    # Import lazy pour éviter les imports circulaires
    from .services.auth import auth_service
    
    success, result = auth_service.change_password(
        user_id=current_user["id"],
        current_password=current_password,
        new_password=new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result

@app.post("/api/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Déconnecter l'utilisateur."""
    # En production, on pourrait invalider le token côté serveur
    return {"message": "Déconnexion réussie"}

# -------------------------------------------------
# Créer un job (protégé par authentification)
# -------------------------------------------------
@app.post("/api/jobs", response_model=JobCreateResponse)
async def create_job(
    file: UploadFile = File(...),
    voice: Optional[str] = Form(None),
    lang: str = Form("fra"),
    session=Depends(db_session),
    current_user: dict = Depends(get_current_user)
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
        user_id=current_user["id"]  # Associer le job à l'utilisateur
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
# Récupérer un job (protégé par authentification)
# -------------------------------------------------
@app.get("/api/jobs/{job_id}", response_model=JobGetResponse)
def get_job(
    job_id: str, 
    session=Depends(db_session),
    current_user: dict = Depends(get_current_user)
):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable")
    
    # Vérifier que l'utilisateur est propriétaire du job
    if job.user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce job"
        )

    return JobGetResponse(
        id=job.id,
        status=job.status.value,
        input_filename=job.input_filename,
        output_mp3_url=job.output_mp3_url,
        output_m4b_url=job.output_m4b_url,
        error=job.error,
    )

# -------------------------------------------------
# Lister les jobs de l'utilisateur
# -------------------------------------------------
@app.get("/api/jobs")
def list_user_jobs(
    session=Depends(db_session),
    current_user: dict = Depends(get_current_user)
):
    """Lister tous les jobs de l'utilisateur connecté."""
    jobs = session.query(Job).filter(Job.user_id == current_user["id"]).all()
    
    return [
        {
            "id": job.id,
            "status": job.status.value,
            "input_filename": job.input_filename,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "output_mp3_url": job.output_mp3_url,
            "output_m4b_url": job.output_m4b_url,
            "error": job.error,
        }
        for job in jobs
    ]

# -------------------------------------------------
# SSE : statut en temps réel (protégé par authentification)
# -------------------------------------------------
@app.get("/api/jobs/{job_id}/events")
async def stream_job_events(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
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
            
            # Vérifier que l'utilisateur est propriétaire du job
            if job.user_id != current_user["id"]:
                session.close()
                yield {"event": "error", "data": "Accès non autorisé"}
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
