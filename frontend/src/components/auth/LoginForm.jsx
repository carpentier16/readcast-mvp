import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation.jsx';
import authService from '../../services/auth.js';

const LoginForm = ({ onSuccess, onSwitchToRegister, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Effacer l'erreur générale
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email_or_username.trim()) {
      newErrors.email_or_username = 'Email ou nom d\'utilisateur requis';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      console.log('🔐 Tentative de connexion avec:', formData);
      
      const result = await authService.login(formData);
      console.log('📡 Résultat connexion:', result);
      
      if (result.success) {
        console.log('✅ Connexion réussie!');
        onSuccess?.(result.data);
      } else {
        console.error('❌ Échec connexion:', result.error);
        setGeneralError(result.error);
      }
    } catch (error) {
      console.error('💥 Erreur exceptionnelle lors de la connexion:', error);
      setGeneralError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 max-w-md w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Connexion
        </h2>
        <p className="text-gray-600">
          Connectez-vous à votre compte ReadCast
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email ou nom d'utilisateur */}
        <div>
          <label htmlFor="email_or_username" className="block text-sm font-medium text-gray-700 mb-2">
            Email ou nom d'utilisateur
          </label>
          <input
            type="text"
            id="email_or_username"
            name="email_or_username"
            value={formData.email_or_username}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.email_or_username ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="votre@email.com ou nom_utilisateur"
            disabled={isLoading}
          />
          {errors.email_or_username && (
            <p className="mt-1 text-sm text-red-600">{errors.email_or_username}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Votre mot de passe"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Erreur générale */}
        {generalError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 text-sm">{generalError}</span>
            </div>
          </div>
        )}

        {/* Bouton de connexion */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </div>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      {/* Liens d'action */}
      <div className="mt-6 text-center">
        <button
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          disabled={isLoading}
        >
          Pas encore de compte ? S'inscrire
        </button>
      </div>

      {/* Bouton fermer */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LoginForm; 