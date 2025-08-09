import os, uuid, asyncio
from .services.extract import extract_text_from_pdf
from .services.tts import synthesize
from .services.post_audio import concat_and_normalize, make_m4b_from_mp3
from .services.storage import put_file
from .services.utils import safe_slug
from .models.db import Job, JobStatus, get_engine, get_session_maker
from .settings import settings

engine = get_engine(settings.DATABASE_URL)
Session = get_session_maker(engine)

def chunk_text(text: str, max_chars: int = 1000):
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

def process_job(job_id: str, local_path: str, voice: str = "Rachel", lang: str = "fra"):
    session = Session()
    try:
        job = session.get(Job, job_id)
        if not job:
            return
        job.status = JobStatus.RUNNING
        session.commit()

        text = extract_text_from_pdf(local_path, lang=lang)
        chunks = chunk_text(text)

        wav_files = []
        out_tmp_dir = os.path.join(settings.LOCAL_STORAGE_PATH, f"tmp/{job_id}")
        os.makedirs(out_tmp_dir, exist_ok=True)
        for i, chunk in enumerate(chunks):
            out_wav = os.path.join(out_tmp_dir, f"{i:05d}.mp3")
            asyncio.run(synthesize(chunk, voice, out_wav))
            wav_files.append(out_wav)

        out_dir_rel = f"outputs/{job_id}"
        out_dir_abs = os.path.join(settings.LOCAL_STORAGE_PATH, out_dir_rel)
        os.makedirs(out_dir_abs, exist_ok=True)

        mp3_path = os.path.join(out_dir_abs, f"{safe_slug(job.input_filename)}.mp3")
        concat_and_normalize(wav_files, mp3_path)

        m4b_path = os.path.join(out_dir_abs, f"{safe_slug(job.input_filename)}.m4b")
        make_m4b_from_mp3(mp3_path, [], m4b_path)

        mp3_url = put_file(mp3_path, f"{out_dir_rel}/output.mp3")
        m4b_url = put_file(m4b_path, f"{out_dir_rel}/output.m4b")

        job.status = JobStatus.DONE
        job.output_mp3_url = mp3_url
        job.output_m4b_url = m4b_url
        session.commit()
    except Exception as e:
        job = session.get(Job, job_id)
        if job:
            job.status = JobStatus.ERROR
            job.error = str(e)
            session.commit()
        raise
    finally:
        session.close()
