import React, { useState } from 'react';
import LoginForm from './auth/LoginForm.jsx';
import RegisterForm from './auth/RegisterForm.jsx';

const SimpleTest = () => {
  const [testInput, setTestInput] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleClick = () => {
    console.log('🔍 Simple button clicked!');
    alert('Simple button works!');
  };

  const handleInputChange = (e) => {
    console.log('🔍 Input change:', e.target.name, e.target.value);
    if (e.target.name === 'testInput') {
      setTestInput(e.target.value);
    } else if (e.target.name === 'testPassword') {
      setTestPassword(e.target.value);
    }
  };

  const testAuthModal = () => {
    console.log('🔍 Testing auth modal...');
    // Simuler l'ouverture du modal d'authentification
    const event = new CustomEvent('openAuthModal', { detail: { type: 'login' } });
    window.dispatchEvent(event);
    alert('Auth modal test triggered! Check if modal opened.');
  };

  const handleAuthSuccess = (data) => {
    console.log('🔍 Auth success:', data);
    alert('Authentication successful!');
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  return (
    <div className="bg-red-100 border border-red-400 rounded-lg p-6 m-4">
      <h2 className="text-xl font-bold text-red-800 mb-4">
        🚨 Test Ultra-Simple
      </h2>
      
      <div className="space-y-4">
        <p className="text-red-700">
          Si vous voyez ce texte, React fonctionne.
        </p>
        
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cliquez-moi (Test Simple)
        </button>
        
        {/* Test de l'authentification */}
        <div className="bg-blue-100 p-4 rounded border">
          <h3 className="font-semibold text-blue-800 mb-3">🔐 Test de l'Authentification</h3>
          <div className="space-y-2">
            <button
              onClick={testAuthModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Test Modal d'Authentification
            </button>
            <button
              onClick={() => setShowLoginForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            >
              Test LoginForm Direct
            </button>
            <button
              onClick={() => setShowRegisterForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test RegisterForm Direct
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Ces boutons testent directement les composants d'authentification
          </p>
        </div>

        {/* Test de connectivité API */}
        <div className="bg-yellow-100 p-4 rounded border">
          <h3 className="font-semibold text-yellow-800 mb-3">🌐 Test de Connectivité API</h3>
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  console.log('🔍 Testing API root endpoint...');
                  const response = await fetch('https://audiobook-api.onrender.com/');
                  const data = await response.text();
                  console.log('✅ API Root endpoint:', response.status, data);
                  alert(`API Root: ${response.status} - ${data.substring(0, 200)}...`);
                } catch (error) {
                  console.error('❌ API Root endpoint failed:', error);
                  alert(`API Root Error: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            >
              Test API Root
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('🔍 Testing API connectivity...');
                  const response = await fetch('https://audiobook-api.onrender.com/health');
                  const data = await response.json();
                  console.log('✅ API Health check:', data);
                  alert(`API Health: ${response.status} - ${JSON.stringify(data)}`);
                } catch (error) {
                  console.error('❌ API Health check failed:', error);
                  alert(`API Error: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-2"
            >
              Test API Health
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('🔍 Testing API auth endpoint...');
                  const response = await fetch('https://audiobook-api.onrender.com/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                  });
                  const data = await response.json();
                  console.log('✅ API Auth endpoint:', response.status, data);
                  alert(`API Auth: ${response.status} - ${JSON.stringify(data)}`);
                } catch (error) {
                  console.error('❌ API Auth endpoint failed:', error);
                  alert(`API Auth Error: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Test API Auth Endpoint
            </button>
          </div>
          <p className="text-xs text-yellow-700 mt-2">
            Ces boutons testent la connectivité avec le backend Render
          </p>
        </div>

        {/* Affichage des formulaires d'authentification */}
        {showLoginForm && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-gray-800 mb-3">🔑 Test LoginForm</h3>
            <LoginForm
              onSuccess={handleAuthSuccess}
              onClose={() => setShowLoginForm(false)}
            />
          </div>
        )}

        {showRegisterForm && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-gray-800 mb-3">📝 Test RegisterForm</h3>
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onClose={() => setShowRegisterForm(false)}
            />
          </div>
        )}
        
        {/* Test des formulaires */}
        <div className="bg-white p-4 rounded border mt-4">
          <h3 className="font-semibold text-gray-800 mb-3">🧪 Test des Champs de Saisie</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Input:
              </label>
              <input
                type="text"
                name="testInput"
                value={testInput}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Tapez quelque chose ici..."
              />
              <p className="text-xs text-gray-600 mt-1">
                Valeur: "{testInput}"
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Password:
              </label>
              <input
                type="password"
                name="testPassword"
                value={testPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Mot de passe test"
              />
              <p className="text-xs text-gray-600 mt-1">
                Longueur: {testPassword.length} caractères
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <p className="text-sm text-gray-700">
            <strong>React Version:</strong> {React.version}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Timestamp:</strong> {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest; 