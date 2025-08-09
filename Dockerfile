# Render/Railway-ready Dockerfile (API + Worker dans le même conteneur)
FROM python:3.11-slim

# Dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg tesseract-ocr git build-essential libmagic1 poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Code application
COPY backend /app/backend

# Script de démarrage
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# Lance le worker + l'API
CMD ["/app/start.sh"]
