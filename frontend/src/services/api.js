// Services API pour la connexion avec le backend
import { config, getApiUrl, devLog, errorLog } from '../config/environment.js';
import authService from './auth.js';

class APIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Fonction utilitaire pour les appels API avec authentification automatique
async function apiCall(endpoint, options = {}, requireAuth = false) {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Ajouter l'en-tête d'authentification si requis
  if (requireAuth) {
    const authHeader = authService.getAuthHeader();
    if (authHeader.Authorization) {
      defaultOptions.headers.Authorization = authHeader.Authorization;
    } else {
      throw new APIError('Authentification requise', 401, {});
    }
  }

  try {
    devLog(`API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Si l'authentification a échoué, essayer de rafraîchir le token
    if (response.status === 401 && requireAuth) {
      devLog('Token expiré, tentative de rafraîchissement...');
      const refreshResult = await authService.refreshAccessToken();
      
      if (refreshResult.success) {
        // Réessayer l'appel avec le nouveau token
        const newAuthHeader = authService.getAuthHeader();
        defaultOptions.headers.Authorization = newAuthHeader.Authorization;
        
        const retryResponse = await fetch(url, { ...defaultOptions, ...options });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new APIError(
            errorData.detail || `HTTP ${retryResponse.status}`,
            retryResponse.status,
            errorData
          );
        }
        
        const data = await retryResponse.json();
        devLog(`API Response (retry):`, data);
        return data;
      } else {
        // Le rafraîchissement a échoué, déconnecter l'utilisateur
        authService.clearAuth();
        throw new APIError('Session expirée', 401, {});
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    devLog(`API Response:`, data);
    return data;
  } catch (error) {
    errorLog(`API Error ${endpoint}:`, error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error.message || 'Erreur de connexion',
      0,
      { originalError: error }
    );
  }
}

// Service pour la gestion des jobs PDF (avec authentification)
export const jobsAPI = {
  // Créer un nouveau job de conversion
  async createJob(file, voice, language) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('voice', voice || config.DEFAULT_VOICE);
    formData.append('lang', language || config.DEFAULT_LANGUAGE);

    return apiCall('/api/jobs', {
      method: 'POST',
      body: formData,
      headers: {}, // Pas de Content-Type pour FormData
    }, true); // Requiert l'authentification
  },

  // Récupérer les détails d'un job
  async getJob(jobId) {
    return apiCall(`/api/jobs/${jobId}`, {}, true);
  },

  // Obtenir le statut en temps réel d'un job
  getJobEvents(jobId, onUpdate, onError) {
    const url = getApiUrl(`/api/jobs/${jobId}/events`);
    devLog(`Starting SSE connection to: ${url}`);
    
    // Ajouter le token d'authentification aux headers SSE
    const token = authService.getAccessToken();
    const eventSource = new EventSource(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        devLog(`SSE Update:`, data);
        onUpdate(data);
      } catch (error) {
        errorLog('Erreur parsing SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      errorLog('Erreur SSE:', error);
      onError?.(error);
      eventSource.close();
    };

    // Retourner la fonction de fermeture
    return () => {
      devLog(`Closing SSE connection to: ${url}`);
      eventSource.close();
    };
  },

  // Lister tous les jobs de l'utilisateur
  async listJobs() {
    return apiCall('/api/jobs', {}, true);
  },

  // Vérifier la santé de l'API
  async healthCheck() {
    return apiCall('/health');
  }
};

// Service pour la gestion des projets
export const projectsAPI = {
  // Sauvegarder un projet localement
  saveProject(project) {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }
    
    localStorage.setItem('readcast-projects', JSON.stringify(projects));
    devLog('Project saved:', project);
    return project;
  },

  // Récupérer tous les projets
  getProjects() {
    try {
      const saved = localStorage.getItem('readcast-projects');
      const projects = saved ? JSON.parse(saved) : [];
      devLog(`Loaded ${projects.length} projects from localStorage`);
      return projects;
    } catch (error) {
      errorLog('Erreur lecture projets:', error);
      return [];
    }
  },

  // Supprimer un projet
  deleteProject(projectId) {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem('readcast-projects', JSON.stringify(filtered));
    devLog(`Project deleted: ${projectId}`);
    return true;
  },

  // Mettre à jour un projet
  updateProject(projectId, updates) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index >= 0) {
      projects[index] = { ...projects[index], ...updates };
      localStorage.setItem('readcast-projects', JSON.stringify(projects));
      devLog(`Project updated: ${projectId}`, updates);
      return projects[index];
    }
    
    return null;
  }
};

// Service pour la gestion des fichiers
export const fileAPI = {
  // Valider un fichier PDF
  validatePDF(file) {
    if (!file) {
      throw new Error('Aucun fichier sélectionné');
    }
    
    if (file.type !== 'application/pdf') {
      throw new Error('Le fichier doit être au format PDF');
    }
    
    if (file.size > config.MAX_FILE_SIZE) {
      throw new Error(`Le fichier est trop volumineux (max ${config.MAX_FILE_SIZE / (1024 * 1024)} MB)`);
    }
    
    return true;
  },

  // Obtenir la taille formatée d'un fichier
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Créer un objet projet à partir d'un fichier
  createProjectFromFile(file, voice, language) {
    return {
      id: Date.now().toString(),
      title: file.name.replace('.pdf', ''),
      originalFile: file,
      voice: voice || config.DEFAULT_VOICE,
      language: language || config.DEFAULT_LANGUAGE,
      fileSize: file.size,
      status: 'pending',
      createdAt: new Date().toISOString(),
      progress: 0
    };
  }
};

// Service pour la gestion des erreurs
export const errorHandler = {
  // Gérer les erreurs API de manière centralisée
  handleAPIError(error, context = '') {
    errorLog(`Erreur API ${context}:`, error);
    
    let userMessage = 'Une erreur est survenue';
    
    if (error instanceof APIError) {
      switch (error.status) {
        case 400:
          userMessage = 'Données invalides. Vérifiez votre fichier PDF.';
          break;
        case 401:
          userMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          userMessage = 'Accès non autorisé à cette ressource.';
          break;
        case 413:
          userMessage = 'Fichier trop volumineux. Taille maximum : 100 MB.';
          break;
        case 500:
          userMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          userMessage = error.message || 'Erreur de traitement';
      }
    } else if (error.message.includes('fetch')) {
      userMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    }
    
    return {
      message: userMessage,
      technical: error.message,
      status: error.status || 0
    };
  },

  // Afficher une notification d'erreur
  showError(message, duration = 5000) {
    // Créer une notification d'erreur
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
};

// Export par défaut
export default {
  jobs: jobsAPI,
  projects: projectsAPI,
  files: fileAPI,
  errors: errorHandler,
  config: config
}; 