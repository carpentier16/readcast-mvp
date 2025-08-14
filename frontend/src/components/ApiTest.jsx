import React, { useState } from 'react';
import { getApiUrl } from '../config/environment.js';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    const results = {};

    try {
      // Test 1: Endpoint de santé
      console.log('🧪 Test 1: Endpoint de santé');
      const healthUrl = getApiUrl('/health');
      console.log('URL testée:', healthUrl);
      
      const healthResponse = await fetch(healthUrl);
      const healthData = await healthResponse.json();
      
      results.health = {
        success: healthResponse.ok,
        status: healthResponse.status,
        data: healthData,
        url: healthUrl
      };
      
      console.log('✅ Santé API:', results.health);
    } catch (error) {
      results.health = {
        success: false,
        error: error.message,
        url: getApiUrl('/health')
      };
      console.error('❌ Erreur santé API:', error);
    }

    // Test 2: Test d'inscription (sans données valides)
    try {
      console.log('🧪 Test 2: Endpoint d\'inscription (validation)');
      const registerUrl = getApiUrl('/api/auth/register');
      console.log('URL testée:', registerUrl);
      
      const registerResponse = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const registerData = await registerResponse.json();
      
      results.register = {
        success: registerResponse.ok,
        status: registerResponse.status,
        data: registerData,
        url: registerUrl
      };
      
      console.log('✅ Test inscription:', results.register);
    } catch (error) {
      results.register = {
        success: false,
        error: error.message,
        url: getApiUrl('/api/auth/register')
      };
      console.error('❌ Erreur test inscription:', error);
    }

    // Test 3: Test de connexion (sans données valides)
    try {
      console.log('🧪 Test 3: Endpoint de connexion (validation)');
      const loginUrl = getApiUrl('/api/auth/login');
      console.log('URL testée:', loginUrl);
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const loginData = await loginResponse.json();
      
      results.login = {
        success: loginResponse.ok,
        status: loginResponse.status,
        data: loginData,
        url: loginUrl
      };
      
      console.log('✅ Test connexion:', results.login);
    } catch (error) {
      results.login = {
        success: false,
        error: error.message,
        url: getApiUrl('/api/auth/login')
      };
      console.error('❌ Erreur test connexion:', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 Test de Connectivité API
        </h2>
        <p className="text-gray-600">
          Vérifiez que votre frontend peut communiquer avec le backend sur Render
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={testApiConnection}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Test en cours...' : 'Lancer les tests API'}
        </button>
      </div>

      {/* Configuration actuelle */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Configuration actuelle</h3>
        <div className="text-sm text-gray-600">
          <p><strong>URL API:</strong> {getApiUrl('')}</p>
          <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
          <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
        </div>
      </div>

      {/* Résultats des tests */}
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Résultats des tests</h3>
          
          {/* Test de santé */}
          {testResults.health && (
            <div className={`p-4 rounded-lg border ${
              testResults.health.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {getStatusIcon(testResults.health.success)} Endpoint de santé
                </h4>
                <span className={`text-sm font-medium ${getStatusColor(testResults.health.success)}`}>
                  {testResults.health.success ? 'Succès' : 'Échec'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>URL:</strong> {testResults.health.url}</p>
                <p><strong>Status:</strong> {testResults.health.status}</p>
                {testResults.health.data && (
                  <p><strong>Réponse:</strong> {JSON.stringify(testResults.health.data)}</p>
                )}
                {testResults.health.error && (
                  <p><strong>Erreur:</strong> {testResults.health.error}</p>
                )}
              </div>
            </div>
          )}

          {/* Test d'inscription */}
          {testResults.register && (
            <div className={`p-4 rounded-lg border ${
              testResults.register.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {getStatusIcon(testResults.register.success)} Endpoint d'inscription
                </h4>
                <span className={`text-sm font-medium ${getStatusColor(testResults.register.success)}`}>
                  {testResults.register.success ? 'Succès' : 'Échec'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>URL:</strong> {testResults.register.url}</p>
                <p><strong>Status:</strong> {testResults.register.status}</p>
                {testResults.register.data && (
                  <p><strong>Réponse:</strong> {JSON.stringify(testResults.register.data)}</p>
                )}
                {testResults.register.error && (
                  <p><strong>Erreur:</strong> {testResults.register.error}</p>
                )}
              </div>
            </div>
          )}

          {/* Test de connexion */}
          {testResults.login && (
            <div className={`p-4 rounded-lg border ${
              testResults.login.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {getStatusIcon(testResults.login.success)} Endpoint de connexion
                </h4>
                <span className={`text-sm font-medium ${getStatusColor(testResults.login.success)}`}>
                  {testResults.login.success ? 'Succès' : 'Échec'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>URL:</strong> {testResults.login.url}</p>
                <p><strong>Status:</strong> {testResults.login.status}</p>
                {testResults.login.data && (
                  <p><strong>Réponse:</strong> {JSON.stringify(testResults.login.data)}</p>
                )}
                {testResults.login.error && (
                  <p><strong>Erreur:</strong> {testResults.login.error}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions de débogage */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">🔍 Instructions de débogage</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>1. <strong>Ouvrez la console du navigateur</strong> (F12) pour voir les logs détaillés</p>
          <p>2. <strong>Vérifiez l'URL de l'API</strong> dans la configuration ci-dessus</p>
          <p>3. <strong>Testez manuellement</strong> l'URL de santé dans un nouvel onglet</p>
          <p>4. <strong>Vérifiez les CORS</strong> dans la console du navigateur</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 