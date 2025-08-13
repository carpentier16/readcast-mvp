// Configuration API pour ReadCast
const API_CONFIG = {
  // URLs de base selon l'environnement
  BASE_URL: import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV 
      ? 'http://localhost:8000' 
      : 'https://readcast-mvp.onrender.com'
    ),
  
  // Endpoints API
  ENDPOINTS: {
    HEALTH: '/health',
    JOBS: '/api/jobs',
    JOB_STATUS: (id) => `/api/jobs/${id}`,
    JOB_EVENTS: (id) => `/api/jobs/${id}/events`,
  },
  
  // Configuration des requêtes
  REQUEST_CONFIG: {
    timeout: 30000, // 30 secondes
    headers: {
      'Content-Type': 'application/json',
    },
  },
  
  // Configuration des uploads
  UPLOAD_CONFIG: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf'],
    chunkSize: 1024 * 1024, // 1MB par chunk
  },
  
  // Configuration des voix
  VOICES: {
    default: 'Rachel',
    options: [
      { id: 'Rachel', name: 'Rachel', lang: 'en', gender: 'female' },
      { id: 'Domi', name: 'Domi', lang: 'en', gender: 'female' },
      { id: 'Bella', name: 'Bella', lang: 'en', gender: 'female' },
      { id: 'Antoni', name: 'Antoni', lang: 'en', gender: 'male' },
      { id: 'Thiago', name: 'Thiago', lang: 'en', gender: 'male' },
      { id: 'Josh', name: 'Josh', lang: 'en', gender: 'male' },
    ]
  },
  
  // Configuration des langues
  LANGUAGES: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ],
  
  // Messages d'erreur
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion au serveur',
    FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 50MB)',
    INVALID_FILE_TYPE: 'Type de fichier non supporté (PDF uniquement)',
    UPLOAD_FAILED: 'Échec du téléchargement',
    CONVERSION_FAILED: 'Échec de la conversion',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
  },
  
  // Statuts des jobs
  JOB_STATUSES: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    DONE: 'done',
    ERROR: 'error',
  },
  
  // Configuration des retry
  RETRY_CONFIG: {
    maxRetries: 3,
    delay: 1000, // 1 seconde
    backoff: 2, // Multiplicateur
  }
};

// Fonction utilitaire pour construire l'URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction utilitaire pour gérer les erreurs
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Erreur de réponse du serveur
    return {
      message: error.response.data?.detail || error.response.data?.message || API_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Erreur de réseau
    return {
      message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
      status: 0,
      data: null,
    };
  } else {
    // Erreur de configuration
    return {
      message: error.message || API_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR,
      status: 0,
      data: null,
    };
  }
};

// Fonction utilitaire pour valider les fichiers
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné' };
  }
  
  if (file.size > API_CONFIG.UPLOAD_CONFIG.maxFileSize) {
    return { valid: false, error: API_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE };
  }
  
  if (!API_CONFIG.UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return { valid: false, error: API_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE };
  }
  
  return { valid: true, error: null };
};

export default API_CONFIG; 