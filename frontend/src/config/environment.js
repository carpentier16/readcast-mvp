// Configuration de l'environnement
export const config = {
  // URL de l'API backend
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Mode de développement
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  
  // Configuration des timeouts
  API_TIMEOUT: 30000, // 30 secondes
  
  // Configuration des retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 seconde
  
  // Configuration des fichiers
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  ALLOWED_FILE_TYPES: ['application/pdf'],
  
  // Configuration des voix
  DEFAULT_VOICE: 'Rachel',
  DEFAULT_LANGUAGE: 'fra',
  
  // Configuration de l'audio
  AUDIO_FORMATS: ['mp3', 'm4b'],
  DEFAULT_VOLUME: 0.7,
  DEFAULT_PLAYBACK_RATE: 1.0
};

// Fonction utilitaire pour vérifier l'environnement
export const isDevelopment = () => config.DEV_MODE;
export const isProduction = () => !config.DEV_MODE;

// Fonction pour obtenir l'URL complète de l'API
export const getApiUrl = (endpoint) => {
  const baseUrl = config.API_URL.replace(/\/$/, ''); // Supprimer le slash final
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Fonction pour logger en mode développement
export const devLog = (...args) => {
  if (isDevelopment()) {
    console.log('[DEV]', ...args);
  }
};

// Fonction pour logger les erreurs
export const errorLog = (...args) => {
  console.error('[ERROR]', ...args);
}; 