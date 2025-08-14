import { supabase } from '../config/supabase.js';

class SupabaseAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    
    // Initialiser l'état d'authentification
    this.initAuth();
  }

  // Initialiser l'authentification au démarrage
  async initAuth() {
    try {
      // Récupérer la session actuelle
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erreur lors de la récupération de la session:', error);
        return;
      }

      if (session) {
        this.isAuthenticated = true;
        this.currentUser = session.user;
        console.log('✅ Session Supabase restaurée:', this.currentUser.email);
      }

      // Écouter les changements d'authentification
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Changement d\'état d\'authentification:', event);
        
        if (event === 'SIGNED_IN' && session) {
          this.isAuthenticated = true;
          this.currentUser = session.user;
          console.log('✅ Utilisateur connecté:', this.currentUser.email);
        } else if (event === 'SIGNED_OUT') {
          this.isAuthenticated = false;
          this.currentUser = null;
          console.log('🚪 Utilisateur déconnecté');
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'auth:', error);
    }
  }

  // Inscription d'un nouvel utilisateur
  async register(userData) {
    try {
      console.log('📝 Tentative d\'inscription Supabase:', userData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name
          }
        }
      });

      if (error) {
        console.error('❌ Erreur d\'inscription Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Inscription Supabase réussie:', data.user?.email);
      return { success: true, data: { user: data.user } };

    } catch (error) {
      console.error('💥 Exception lors de l\'inscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Connexion utilisateur
  async login(credentials) {
    try {
      console.log('🔐 Tentative de connexion Supabase:', credentials.email_or_username);
      
      // Essayer d'abord avec l'email
      let { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email_or_username,
        password: credentials.password
      });

      // Si ça ne marche pas, essayer avec le nom d'utilisateur
      if (error && credentials.email_or_username.includes('@') === false) {
        console.log('🔄 Tentative avec nom d\'utilisateur...');
        // Note: Supabase n'a pas de connexion par nom d'utilisateur natif
        // Il faudrait d'abord récupérer l'email depuis la base de données
        return { success: false, error: 'Connexion par nom d\'utilisateur non supportée pour l\'instant. Utilisez votre email.' };
      }

      if (error) {
        console.error('❌ Erreur de connexion Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Connexion Supabase réussie:', data.user?.email);
      return { success: true, data: { user: data.user } };

    } catch (error) {
      console.error('💥 Exception lors de la connexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Déconnexion
  async logout() {
    try {
      console.log('🚪 Tentative de déconnexion Supabase');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        return { success: false, error: error.message };
      }

      this.isAuthenticated = false;
      this.currentUser = null;
      console.log('✅ Déconnexion Supabase réussie');
      
      return { success: true };

    } catch (error) {
      console.error('💥 Exception lors de la déconnexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier l'état d'authentification
  async checkAuthStatus() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erreur lors de la vérification de l\'auth:', error);
        return { isAuthenticated: false, user: null };
      }

      if (session) {
        this.isAuthenticated = true;
        this.currentUser = session.user;
        return { isAuthenticated: true, user: session.user };
      } else {
        this.isAuthenticated = false;
        this.currentUser = null;
        return { isAuthenticated: false, user: null };
      }

    } catch (error) {
      console.error('💥 Exception lors de la vérification de l\'auth:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser;
  }

  // Vérifier si l'utilisateur est connecté
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Obtenir l'en-tête d'autorisation pour les requêtes API
  getAuthHeader() {
    const token = supabase.auth.getSession();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Créer et exporter une instance unique
const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService; 