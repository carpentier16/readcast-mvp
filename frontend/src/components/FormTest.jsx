import React, { useState } from 'react';

const FormTest = () => {
  const [testInput, setTestInput] = useState('');
  const [testTextarea, setTestTextarea] = useState('');
  const [testSelect, setTestSelect] = useState('option1');

  const handleInputChange = (e) => {
    console.log('🔍 Input change event:', e.target.name, e.target.value);
    setTestInput(e.target.value);
  };

  const handleTextareaChange = (e) => {
    console.log('🔍 Textarea change event:', e.target.name, e.target.value);
    setTestTextarea(e.target.value);
  };

  const handleSelectChange = (e) => {
    console.log('🔍 Select change event:', e.target.name, e.target.value);
    setTestSelect(e.target.value);
  };

  const handleClick = () => {
    console.log('🔍 Button clicked!');
    alert('Button works!');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 Test des Formulaires
        </h2>
        <p className="text-gray-600">
          Testez si les champs de saisie fonctionnent
        </p>
      </div>

      <div className="space-y-6">
        {/* Test Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Input Field
          </label>
          <input
            type="text"
            name="testInput"
            value={testInput}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tapez quelque chose ici..."
          />
          <p className="mt-2 text-sm text-gray-600">
            Valeur actuelle: <strong>"{testInput}"</strong>
          </p>
        </div>

        {/* Test Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Textarea
          </label>
          <textarea
            name="testTextarea"
            value={testTextarea}
            onChange={handleTextareaChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tapez du texte ici..."
          />
          <p className="mt-2 text-sm text-gray-600">
            Valeur actuelle: <strong>"{testTextarea}"</strong>
          </p>
        </div>

        {/* Test Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Select
          </label>
          <select
            name="testSelect"
            value={testSelect}
            onChange={handleSelectChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
          <p className="mt-2 text-sm text-gray-600">
            Valeur sélectionnée: <strong>"{testSelect}"</strong>
          </p>
        </div>

        {/* Test Button */}
        <div>
          <button
            onClick={handleClick}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Test Button (Cliquez-moi)
          </button>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Debug Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Input:</strong> {testInput}</p>
            <p><strong>Textarea:</strong> {testTextarea}</p>
            <p><strong>Select:</strong> {testSelect}</p>
            <p><strong>React Version:</strong> {React.version}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions de Test</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. <strong>Essayez de taper</strong> dans le champ input</p>
            <p>2. <strong>Essayez de taper</strong> dans le textarea</p>
            <p>3. <strong>Essayez de changer</strong> la sélection</p>
            <p>4. <strong>Cliquez sur le bouton</strong> pour tester l'interactivité</p>
            <p>5. <strong>Ouvrez la console</strong> (F12) pour voir les logs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormTest; 