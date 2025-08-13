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

  // Upload de fichier avec progression et conversion
  async uploadFileWithProgress(file, voice = null, language = 'en', onProgress, onStatusUpdate) {
    try {
      // Étape 1: Créer le job
      onStatusUpdate('Creating conversion job...', 10);
      const job = await this.createJob(file, voice, language);
      
      onStatusUpdate('File uploaded successfully!', 30);
      onProgress(30);
      
      // Étape 2: Écouter les événements du job
      return new Promise((resolve, reject) => {
        let isCompleted = false;
        
        const stopListening = this.listenToJobEvents(
          job.id,
          (data) => {
            // Mise à jour du statut
            if (data.status === 'processing') {
              onStatusUpdate('Converting PDF to audio...', 60);
              onProgress(60);
            } else if (data.status === 'done') {
              onStatusUpdate('Conversion completed!', 100);
              onProgress(100);
              if (!isCompleted) {
                isCompleted = true;
                resolve({
                  jobId: job.id,
                  status: 'done',
                  mp3Url: data.mp3,
                  m4bUrl: data.m4b,
                  filename: file.name
                });
              }
            } else if (data.status === 'error') {
              onStatusUpdate('Conversion failed!', 0);
              onProgress(0);
              if (!isCompleted) {
                isCompleted = true;
                reject(new Error(data.error || 'Conversion failed'));
              }
            }
          },
          (error) => {
            onStatusUpdate('Connection error!', 0);
            onProgress(0);
            if (!isCompleted) {
              isCompleted = true;
              reject(error);
            }
          },
          (data) => {
            // Job terminé
            if (!isCompleted) {
              isCompleted = true;
              if (data.status === 'done') {
                resolve({
                  jobId: job.id,
                  status: 'done',
                  mp3Url: data.mp3,
                  m4bUrl: data.m4b,
                  filename: file.name
                });
              } else {
                reject(new Error(data.error || 'Conversion failed'));
              }
            }
          }
        );

        // Timeout de sécurité
        setTimeout(() => {
          if (!isCompleted) {
            isCompleted = true;
            stopListening();
            reject(new Error('Conversion timeout'));
          }
        }, 300000); // 5 minutes
      });
      
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Télécharger un fichier MP3
  async downloadMp3(url, filename) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename.replace('.pdf', '.mp3');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Lire un fichier MP3 (prévisualisation)
  async playMp3(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Audio fetch failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const audioUrl = window.URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      
      // Nettoyer l'URL après la lecture
      audio.onended = () => {
        window.URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        window.URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback failed');
      };
      
      return audio;
    } catch (error) {
      throw handleApiError(error);
    }
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