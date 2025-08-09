# Render/Railway-ready Dockerfile (API + Worker dans le même conteneur)
FROM python:3.11-slim

# Installer dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg tesseract-ocr git build-essential libmagic1 poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Installer dépendances Python
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY backend /app/backend
COPY .env* /app/ || true

# Copier le script de démarrage et le rendre exécutable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Config
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# Lancer le worker + l'API
CMD ["/app/start.sh"]
