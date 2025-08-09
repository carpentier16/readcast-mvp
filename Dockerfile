# Render/Railway-ready Dockerfile (API + Worker in one container)
FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg tesseract-ocr git build-essential libmagic1 poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Python deps
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY backend /app/backend
COPY .env* /app/ || true

# Start script (launches RQ worker in background, then API)
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# Run worker + API
CMD ["/app/start.sh"]
