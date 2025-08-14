import React, { useState } from 'react';

const SimpleTest = () => {
  const [testInput, setTestInput] = useState('');
  const [testPassword, setTestPassword] = useState('');

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
          <button
            onClick={testAuthModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Modal d'Authentification
          </button>
          <p className="text-xs text-blue-700 mt-2">
            Ce bouton teste si le modal d'auth peut être ouvert
          </p>
        </div>
        
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