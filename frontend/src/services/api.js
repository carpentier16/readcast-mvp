import API_CONFIG, { buildApiUrl, handleApiError, validateFile } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.config = API_CONFIG.REQUEST_CONFIG;
  }

  // Vérifier la santé du serveur
  async healthCheck() {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        ...this.config,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Créer un nouveau job de conversion
  async createJob(file, voice = null, language = 'en') {
    try {
      // Valider le fichier
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Préparer les données
      const formData = new FormData();
      formData.append('file', file);
      formData.append('voice', voice || API_CONFIG.VOICES.default);
      formData.append('lang', language);

      // Envoyer la requête
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.JOBS), {
        method: 'POST',
        body: formData,
        // Pas de Content-Type pour FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Récupérer le statut d'un job
  async getJobStatus(jobId) {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.JOB_STATUS(jobId)), {
        method: 'GET',
        ...this.config,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Écouter les événements d'un job en temps réel
  listenToJobEvents(jobId, onUpdate, onError, onComplete) {
    const eventSource = new EventSource(buildApiUrl(API_CONFIG.ENDPOINTS.JOB_EVENTS(jobId)));

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
        
        // Vérifier si le job est terminé
        if (data.status === API_CONFIG.JOB_STATUSES.DONE || data.status === API_CONFIG.JOB_STATUSES.ERROR) {
          onComplete(data);
          eventSource.close();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      onError(error);
      eventSource.close();
    };

    // Retourner la fonction de fermeture pour permettre l'arrêt manuel
    return () => eventSource.close();
  }

  // Upload de fichier avec progression
  async uploadFileWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Gérer la progression
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });

      // Gérer la réponse
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // Gérer les erreurs
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      // Préparer et envoyer
      const formData = new FormData();
      formData.append('file', file);
      formData.append('voice', API_CONFIG.VOICES.default);
      formData.append('lang', 'en');

      xhr.open('POST', buildApiUrl(API_CONFIG.ENDPOINTS.JOBS));
      xhr.send(formData);
    });
  }

  // Retry automatique avec backoff exponentiel
  async retryRequest(requestFn, maxRetries = API_CONFIG.RETRY_CONFIG.maxRetries) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Attendre avant de réessayer
        const delay = API_CONFIG.RETRY_CONFIG.delay * Math.pow(API_CONFIG.RETRY_CONFIG.backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Test de connectivité
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await this.healthCheck();
      const endTime = Date.now();
      
      return {
        connected: true,
        latency: endTime - startTime,
        response,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        latency: null,
      };
    }
  }
}

// Instance singleton
const apiService = new ApiService();

export default apiService; 