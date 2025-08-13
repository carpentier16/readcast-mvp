# 🚀 ReadCast MVP - Conversion PDF vers Audio

Application complète de conversion PDF vers audio avec extraction intelligente, gestion des projets et lecteur audio intégré.

## ✨ Fonctionnalités

### 🎯 **Frontend (React + Vite)**
- **Interface moderne** avec Tailwind CSS
- **Gestion des projets** avec historique complet
- **Extraction PDF** avec barre de progression en temps réel
- **Lecteur audio intégré** avec contrôles avancés
- **Système de traduction** multilingue (FR/EN/ES)
- **Drag & Drop** pour les fichiers PDF
- **Responsive design** pour tous les appareils

### 🔧 **Backend (FastAPI + Python)**
- **API REST** complète avec FastAPI
- **Extraction PDF** robuste avec PDFPlumber + OCR
- **Conversion TTS** avec ElevenLabs
- **Traitement asynchrone** avec Redis + RQ
- **Stockage** local et cloud (S3)
- **Formats multiples** : MP3 + M4B (audiobook)
- **Suivi en temps réel** avec Server-Sent Events (SSE)

## 🚀 Installation et Démarrage

### Prérequis
- **Python 3.8+** pour le backend
- **Node.js 16+** pour le frontend
- **Redis** pour la gestion des jobs
- **FFmpeg** pour le traitement audio

### 1. Backend

```bash
# Installer les dépendances Python
cd backend
pip install -r requirements.txt

# Configurer les variables d'environnement
export ELEVENLABS_API_KEY="votre_clé_api"
export DATABASE_URL="sqlite:///./readcast.db"
export REDIS_URL="redis://localhost:6379"

# Démarrer Redis (si pas déjà en cours)
redis-server

# Démarrer le backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
# Installer les dépendances Node.js
cd frontend
npm install

# Configurer l'URL de l'API (optionnel)
# Créer un fichier .env.local avec :
# VITE_API_URL=http://localhost:8000

# Démarrer en mode développement
npm run dev

# Ou construire pour la production
npm run build
```

### 3. Vérification

- **Backend** : http://localhost:8000/health
- **Frontend** : http://localhost:5173
- **API Docs** : http://localhost:8000/docs

## 🎮 Utilisation

### **Créer un nouveau projet**
1. Cliquez sur **"Projets"** dans la navigation
2. Cliquez sur **"Commencer"**
3. Sélectionnez votre fichier PDF (drag & drop ou clic)
4. Choisissez la voix et la langue
5. Cliquez sur **"Commencer la conversion"**

### **Suivre la progression**
- **Barre de progression** en temps réel
- **Statuts détaillés** : Upload → Extraction → Conversion → Terminé
- **Notifications** automatiques

### **Gérer vos projets**
- **Historique complet** avec recherche et tri
- **Téléchargement** des fichiers MP3 et M4B
- **Lecteur audio intégré** avec contrôles avancés
- **Suppression** des projets

## 🔌 Architecture Technique

### **Frontend**
```
src/
├── components/          # Composants React
│   ├── PDFExtractor    # Extraction PDF avec progression
│   ├── ProjectManager  # Gestion des projets
│   ├── AudioPlayer     # Lecteur audio intégré
│   └── FileSelector    # Sélection de fichiers
├── services/           # Services API
│   └── api.js         # Connexion backend
├── hooks/              # Hooks React personnalisés
│   └── useTranslation # Système de traduction
└── config/             # Configuration
    └── environment.js  # Variables d'environnement
```

### **Backend**
```
backend/
├── main.py            # Point d'entrée FastAPI
├── workers/           # Traitement asynchrone
│   └── processor.py  # Pipeline de conversion
├── services/          # Services métier
│   ├── extract.py    # Extraction PDF
│   ├── tts.py        # Synthèse vocale
│   └── storage.py    # Gestion des fichiers
└── models/            # Modèles de données
    └── db.py         # Modèles SQLAlchemy
```

## 🌐 API Endpoints

### **Jobs**
- `POST /api/jobs` - Créer un job de conversion
- `GET /api/jobs/{job_id}` - Récupérer le statut d'un job
- `GET /api/jobs/{job_id}/events` - Suivi en temps réel (SSE)

### **Health**
- `GET /health` - Vérifier la santé de l'API

## 🔧 Configuration

### **Variables d'environnement Backend**
```bash
ELEVENLABS_API_KEY=     # Clé API ElevenLabs
DATABASE_URL=           # URL de la base de données
REDIS_URL=              # URL de Redis
LOCAL_STORAGE_PATH=     # Chemin de stockage local
CORS_ORIGINS=           # Origines CORS autorisées
```

### **Variables d'environnement Frontend**
```bash
VITE_API_URL=           # URL de l'API backend
VITE_DEV_MODE=          # Mode développement
```

## 🚀 Déploiement

### **Vercel (Frontend)**
```bash
git push origin main
# Vercel déploie automatiquement
```

### **Render (Backend)**
```bash
# Utilise le render.yaml fourni
# Déploiement automatique depuis GitHub
```

## 🐛 Dépannage

### **Problèmes courants**
1. **Backend non accessible** : Vérifiez Redis et les variables d'environnement
2. **Fichiers non uploadés** : Vérifiez la taille et le format PDF
3. **Conversion échoue** : Vérifiez la clé API ElevenLabs
4. **Frontend ne se connecte pas** : Vérifiez VITE_API_URL

### **Logs**
- **Backend** : Logs dans la console uvicorn
- **Frontend** : Logs dans la console du navigateur (mode dev)
- **Redis** : Logs Redis pour les jobs

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation de l'API
- Vérifiez les logs d'erreur

---

**ReadCast** - Transformez vos PDFs en audio en quelques clics ! 🎧📚
