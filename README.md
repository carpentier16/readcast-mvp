# Audiobook SaaS – MVP (Render + Vercel)

Pipeline: Upload PDF → Extract/OCR → Chunk → TTS → Concat/Normalize → MP3/M4B → Download.

## Stack
- Frontend: React + Vite (Vercel-ready)
- Backend: FastAPI (Docker; Render-ready)
- Queue: Redis + RQ worker (Render Redis instance)
- Storage: S3-compatible (Backblaze B2 or AWS S3). Local for dev.
- TTS: ElevenLabs implemented (easy to extend to Azure)
- Optional: Stripe (credits) — not wired by default here.

## Local Quickstart
1) Prereqs: Python 3.11+, Node 18+, ffmpeg, Tesseract OCR, Redis
2) Backend & Worker
```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
# terminal A
uvicorn backend.main:app --reload
# terminal B
rq worker --url redis://localhost:6379 mvp_jobs
```
3) Frontend
```bash
cd frontend
npm i
npm run dev
```
4) Visit http://localhost:5173

## Render (Backend + Worker + Redis)
1) Push this repo to GitHub.
2) On Render: **New → Blueprint** and select this repo.
3) Fill env vars in `render.yaml` marked `sync:false`:
   - `S3_ENDPOINT_URL`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
   - `ELEVENLABS_API_KEY` (and optional `OPENAI_API_KEY`)
4) Deploy. Healthcheck: `/health`

## Vercel (Frontend)
1) Import the `frontend/` as a project.
2) Set env var: `VITE_API_BASE=https://<your-render-api>.onrender.com`
3) Deploy.

## Notes
- Render disk is ephemeral → use S3-compatible storage in prod.
- This MVP is optimized for speed-to-first-sale. Improve structure/SSML later.
