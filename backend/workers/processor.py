import os
import asyncio
import traceback

from ..services.extract import extract_text_from_pdf
from ..services.tts import synthesize
from ..services.post_audio import concat_and_normalize, make_m4b_from_mp3
from ..services.storage import put_file
from ..services.utils import safe_slug
from ..models.db import Job, JobStatus, get_engine, get_session_maker
from ..settings import settings

engine = get_engine(settings.DATABASE_URL)
Session = get_session_maker(engine)


def chunk_text(text: str, max_chars: int = 1000):
    """Découpe le texte en morceaux (~max_chars)."""
    parts, buf, count = [], [], 0
    for line in text.splitlines():
        if not line.strip():
            line = "\n"
        if count + len(line) > max_chars:
            parts.append(" ".join(buf))
            buf, count = [], 0
        buf.append(line)
        count += len(line)
    if buf:
        parts.append(" ".join(buf))
    return parts


def _looks_like_voice_id(v: str) -> bool:
    """Heuristique simple: les IDs ElevenLabs sont des chaînes alphanumériques assez longues."""
    v = (v or "").strip()
    return len(v) >= 20 and v.replace("_", "").isalnum()


def resolve_voice_id(v: str) -> str:
    """
    Si v ressemble à un voice_id → on le garde.
    Sinon (ex: 'Rachel'), on utilise ELEVENLABS_VOICE_ID depuis l'env.
    """
    if _looks_like_voice_id(v):
        return v
    return settings.ELEVENLABS_VOICE_ID


def process_job(job_id: str, local_path: str, voice: str = "Rachel", lang: str = "fra"):
    session = Session()
    try:
        job = session.get(Job, job_id)
        if not job:
            return

        job.status = JobStatus.RUNNING
        session.commit()

        # 0) Résoudre la voix (nom → ID via variable d'env)
        voice_id = resolve_voice_id(voice)
        print(f"[Processor] Job {job_id} | voice_id={voice_id}")

        # 1) OCR / extraction
        print(f"[Processor] Job {job_id} | extraction texte…")
        text = extract_text_from_pdf(local_path, lang=lang)
        chunks = chunk_text(text)

        # Limite temporaire de chunks pour debug (configurable via env MAX_CHUNKS)
        limit = int(os.getenv("MAX_CHUNKS", "10"))
        if len(chunks) > limit:
            chunks = chunks[:limit]
        print(f"[Processor] Job {job_id} | chunks à traiter: {len(chunks)}")

        # 2) TTS sur chaque chunk
        tmp_dir = os.path.join(settings.LOCAL_STORAGE_PATH, f"tmp/{job_id}")
        os.makedirs(tmp_dir, exist_ok=True)

        pieces = []
        for i, chunk in enumerate(chunks, start=1):
            out_piece = os.path.join(tmp_dir, f"{i:05d}.mp3")
            print(f"[Processor] Job {job_id} | Synthèse chunk {i}/{len(chunks)}…")
            asyncio.run(synthesize(chunk, voice_id, out_piece))
            print(f"[Processor] Job {job_id} | OK chunk {i}/{len(chunks)}")
            pieces.append(out_piece)

        # 3) Assemblage + normalisation
        out_rel = f"outputs/{job_id}"
        out_abs = os.path.join(settings.LOCAL_STORAGE_PATH, out_rel)
        os.makedirs(out_abs, exist_ok=True)

        base_name = safe_slug(job.input_filename)
        mp3_path = os.path.join(out_abs, f"{base_name}.mp3")
        print(f"[Processor] Job {job_id} | concat + normalisation…")
        concat_and_normalize(pieces, mp3_path)

        m4b_path = os.path.join(out_abs, f"{base_name}.m4b")
        make_m4b_from_mp3(mp3_path, [], m4b_path)

        # 4) Upload vers S3/B2
        print(f"[Processor] Job {job_id} | upload des fichiers…")
        mp3_url = put_file(mp3_path, f"{out_rel}/output.mp3")
        m4b_url = put_file(m4b_path, f"{out_rel}/output.m4b")

        # 5) Fin de job
        job.status = JobStatus.DONE
        job.output_mp3_url = mp3_url
        job.output_m4b_url = m4b_url
        session.commit()
        print(f"[Processor] Job {job_id} | DONE")

    except Exception:
        # Log complet dans la DB pour debug
        err = traceback.format_exc()
        print(f"[Processor] Job {job_id} | ERROR\n{err}")
        job = session.get(Job, job_id)
        if job:
            job.status = JobStatus.ERROR
            job.error = err
            session.commit()
    finally:
        session.close()
