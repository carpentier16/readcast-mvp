// Service d'authentification pour le frontend
import { config, getApiUrl, devLog, errorLog } from '../config/environment.js';

class AuthService {
  constructor() {
    this.tokenKey = 'readcast-access-token';
    this.refreshTokenKey = 'readcast-refresh-token';
    this.userKey = 'readcast-user';
    this.isAuthenticated = false;
    this.currentUser = null;
    
    // Initialiser l'état d'authentification
    this.initAuth();
  }

  // Initialiser l'authentification au démarrage
  initAuth() {
    const token = this.getAccessToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.isAuthenticated = true;
      this.currentUser = user;
      devLog('Authentification restaurée depuis le stockage local');
    }
  }

  // Getters
  getAccessToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getStoredUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Setters
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Nettoyer le stockage
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  // Inscription d'un nouvel utilisateur
  async register(userData) {
    try {
      devLog('Tentative d\'inscription:', userData.email);
      
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Connexion automatique après inscription
      this.setTokens(data.access_token, data.refresh_token);
      this.setUser(data.user);
      this.isAuthenticated = true;

      devLog('Inscription réussie pour:', data.user.email);
      return { success: true, data };

    } catch (error) {
      errorLog('Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Connexion utilisateur
  async login(credentials) {
    try {
      devLog('Tentative de connexion:', credentials.email_or_username);
      
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      // Stocker les tokens et informations utilisateur
      this.setTokens(data.access_token, data.refresh_token);
      this.setUser(data.user);
      this.isAuthenticated = true;

      devLog('Connexion réussie pour:', data.user.email);
      return { success: true, data };

    } catch (error) {
      errorLog('Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Déconnexion
  async logout() {
    try {
      const token = this.getAccessToken();
      
      if (token) {
        // Appeler l'API de déconnexion
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      errorLog('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      this.clearAuth();
      devLog('Déconnexion effectuée');
    }
  }

  // Rafraîchir le token d'accès
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await fetch(getApiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du rafraîchissement du token');
      }

      // Mettre à jour le token d'accès
      localStorage.setItem(this.tokenKey, data.access_token);
      
      devLog('Token d\'accès rafraîchi');
      return { success: true, access_token: data.access_token };

    } catch (error) {
      errorLog('Erreur rafraîchissement token:', error);
      // Si le rafraîchissement échoue, déconnecter l'utilisateur
      this.clearAuth();
      return { success: false, error: error.message };
    }
  }

  // Vérifier si l'utilisateur est connecté
  async checkAuthStatus() {
    try {
      const token = this.getAccessToken();
      
      if (!token) {
        return { isAuthenticated: false };
      }

      const response = await fetch(getApiUrl('/api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        this.setUser(user);
        this.isAuthenticated = true;
        return { isAuthenticated: true, user };
      } else {
        // Token invalide, essayer de le rafraîchir
        const refreshResult = await this.refreshAccessToken();
        if (refreshResult.success) {
          return { isAuthenticated: true, user: this.currentUser };
        } else {
          this.clearAuth();
          return { isAuthenticated: false };
        }
      }

    } catch (error) {
      errorLog('Erreur vérification statut auth:', error);
      this.clearAuth();
      return { isAuthenticated: false };
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(profileData) {
    try {
      const token = this.getAccessToken();
      
      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      const response = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du profil');
      }

      // Mettre à jour l'utilisateur local
      this.setUser(data.user);
      
      devLog('Profil mis à jour:', data.user);
      return { success: true, data };

    } catch (error) {
      errorLog('Erreur mise à jour profil:', error);
      return { success: false, error: error.message };
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const token = this.getAccessToken();
      
      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      const response = await fetch(getApiUrl('/api/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du changement de mot de passe');
      }

      devLog('Mot de passe changé avec succès');
      return { success: true, data };

    } catch (error) {
      errorLog('Erreur changement mot de passe:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir l'en-tête d'autorisation pour les requêtes API
  getAuthHeader() {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Vérifier si l'utilisateur a un rôle spécifique (pour les futures fonctionnalités)
  hasRole(role) {
    // Pour l'instant, tous les utilisateurs connectés ont le même niveau d'accès
    return this.isAuthenticated;
  }

  // Écouter les changements d'authentification
  onAuthChange(callback) {
    this.authChangeCallbacks = this.authChangeCallbacks || [];
    this.authChangeCallbacks.push(callback);
  }

  // Notifier les changements d'authentification
  _notifyAuthChange() {
    if (this.authChangeCallbacks) {
      this.authChangeCallbacks.forEach(callback => callback(this.isAuthenticated, this.currentUser));
    }
  }
}

// Instance singleton du service d'authentification
const authService = new AuthService();

export default authService; 